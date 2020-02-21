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
             * 註冊或註銷監聽
             */
            listen: 4,
            /**
             * 同步Class
             */
            sync: 5,
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
     * @param {boolean} waitRespond 是否等待回傳
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

        let req = { type: Session.protocolType.request, buf }
        let reqJson = JSON.stringify(req);
        let reqBuf = Buffer.from(reqJson, 'utf8');
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

        let res = { type: Session.protocolType.respond, buf }
        let resStr = JSON.stringify(res);
        let resBuf = Buffer.from(resStr, "utf8");
        this.socketWrite(resBuf)
    }

    sendHeartBeat() {
        let hb = { type: Session.protocolType.heartBeat }
        let hbStr = JSON.stringify(hb);
        let hbBuf = Buffer.from(hbStr, "utf8");
        this.socketWrite(hbBuf)
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

    /**
     * 傳送同步資料
     * @param {string} className 
     * @param {number} classId 
     * @param {*} data 
     */
    sendSyncClass(className, classId, data) {
        let sc = { type: Session.protocolType.sync, className, classId, data }
        let scStr = JSON.stringify(sc);
        let scBuf = Buffer.from(scStr, "utf8");
        this.socketWrite(scBuf);
    }
}

/**
 * @typedef {import("net").Socket} Socket
 */