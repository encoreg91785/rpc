"use strict";
let id = 0;
module.exports = class Session {
    /**
     * @param {Socket} socket 
     */
    constructor(socket) {
        /**
         * 唯一編號
         */
        this.id = id++;
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
    }

    /**
     * 
     * @param {string} server 服務名
     * @param {string} method 方法名
     * @param {[]} args 摻數
     * @param {boolean} waitRespond 是否等待回傳
     */
    sendReqest(server, method, args, waitRespond = false) {
        let reqId = 0;
        if (waitRespond) {
            this.reqId++;
            reqId = this.reqId;
        }
        let data = { server, method, args, id: reqId }
        let jsonStr = JSON.stringify(data)
        let buf = Buffer.from(jsonStr, 'utf8');

        let req = { type: 1, buf }
        let reqJson = JSON.stringify(req);
        let reqBuf = Buffer.from(reqJson, 'utf8');
        this.socketWrite(reqBuf)
    }

    /**
     * 
     * @param {number} reqId 
     * @param {*} data 
     */
    sendRespond(reqId, data) {
        let data = { id: reqId, data }
        let jsonStr = JSON.stringify(data);
        let buf = Buffer.from(jsonStr, "utf8");

        let res = { tpye: 2, buf }
        let resStr = JSON.stringify(res);
        let resBuf = Buffer.from(resStr, "utf8");
        this.socketWrite(resBuf)
    }

    /**
     * 傳送資料
     * @param {Buffer} buf 
     */
    socketWrite(buf) {
        var isKernelBufferFull = this.socket.write(buf);
        if (isKernelBufferFull) {
            console.log('Data was flushed successfully from kernel buffer i.e written successfully!');
        } else {
            this.socket.pause();
        }
    }
}

/**
 * @typedef {import("net").Socket} Socket
 */