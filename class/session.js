"use strict";
let id = 0;
const StickPackage = require('../socketServer/stickPackage')
module.exports = class Session {
    static get protocolType() {
        return {
            /**
             * 心跳
             */
            heartBeat: 0,
            /**
             * 驗證
             */
            authentication: 1,
            /**
             * 請求
             */
            request: 2,
            /**
             * 回應
             */
            respond: 3,
            /**
             * 註冊或註銷監聽class
             */
            listenClass: 4,
            /**
             * 同步Class
             */
            syncClass: 5,
            /**
             * 註冊或註銷監聽方法
             */
            listenMethod :6,
            /**
             * 方法執行後回傳
             */
            methodReturn:7
        };
    }
    /**
     * @param {Socket} socket 
     */
    constructor(socket) {
        id++
        /**
         * 唯一編號
         */
        this.id = id;
        /**
         * 請求的流水編號
         */
        this.reqId = 0;
        /**
         * 連線
         */
        this.socket = socket;
        /**
         * RPC回調
         * @type {Object<string,function(*):void>}
         */
        this.rpcCallBack = {};
        /**
         * 玩家id
         */
        this.pid = 0;
    }

    /**
     * 要等迴船返回Promise 不等待返回Null
     * @param {string} server 服務名
     * @param {string} method 方法名
     * @param {[]} args 摻數
     * @param {boolean} waitRespond 是否等待回傳(預設不等)
     * @returns {void|Promise}
     */
    sendReqest(server, method, args, waitRespond = false) {
        let reqId = 0;
        var p = null;
        if (waitRespond) {
            this.reqId++;
            reqId = this.reqId;
            p = new Promise(reslove => {
                this.rpcCallBack[reqId] = reslove;
            })
        }
        let data = { server, method, args, id: reqId }
        let jsonStr = JSON.stringify(data)
        let buf = Buffer.from(jsonStr, 'utf8');

        let req = { type: Session.protocolType.request, buf: [...buf] }
        let reqJson = JSON.stringify(req);
        let reqBuf = Buffer.from(reqJson, 'utf8');
        this.logger(req.type, data);
        this.socketWrite(reqBuf)
        return p;
    }

    /**
     * 
     * @param {number} reqId 
     * @param {*} respondData 
     */
    sendRespond(reqId, respondData) {
        let data = { id: reqId, data: respondData }
        let jsonStr = JSON.stringify(data);
        let buf = Buffer.from(jsonStr, "utf8");

        let res = { type: Session.protocolType.respond, buf: [...buf] }
        let resStr = JSON.stringify(res);
        let resBuf = Buffer.from(resStr, "utf8");
        this.logger(res.type, data);
        this.socketWrite(resBuf)
    }

    sendHeartBeat() {
        let hb = { type: Session.protocolType.heartBeat }
        let hbStr = JSON.stringify(hb);
        let hbBuf = Buffer.from(hbStr, "utf8");
        this.socketWrite(hbBuf)
    }

    /**
     * 傳送同步資料
     * @param {string} className 
     * @param {*} data 
     */
    sendSyncClass(className, data) {
        let sc = { className, data }
        let scStr = JSON.stringify(sc);
        let scBuf = Buffer.from(scStr, "utf8");

        let syncP = { type: Session.protocolType.syncClass, buf: [...scBuf] }
        let dataStr = JSON.stringify(syncP);
        let dataBuf = Buffer.from(dataStr, "utf8");
        this.logger(syncP.type, sc);
        this.socketWrite(dataBuf)
    }

    /**
     * 傳送資料
     * @param {Buffer} buf 
     */
    socketWrite(buf) {
        let sendBuf = StickPackage.setSendData(buf)
        var isKernelBufferFull = this.socket.write(sendBuf);
        if (isKernelBufferFull == false) {
            console.log(this.socket.id + " pause")
            this.socket.pause();
        }
    }

    logger(type, data) {
        if (type != Session.protocolType.heartBeat) {
            let str = this.id + ":RPC發出---" + Object.keys(Session.protocolType).find(e => Session.protocolType[e] == type);
            str += " :: data : " + JSON.stringify(data);
            console.log(str)
        }
    }
}



/**
 * @typedef {import("net").Socket} Socket
 */