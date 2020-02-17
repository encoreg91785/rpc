/**
 * Socket內有id這個值
 */
"use strict";
const Session = require('../class').Session
const utility = require('../utility');
const playerCenter = require('../manager/playerCenter');

var serversRPC = {};
/**
 * 所有Session
 * @type {Object<string,Session>}
 */
const allSession = {};
/**
 * 初始化
 */
function init() {
    return initAllServerRPC();
}

/**
 * @param {Socket} socket
 * @param {Buffer} buf
 */
function parseBuffer(socket, buf) {
    let s = getSessionById(socket.id);
    /**
     * @type {protocol}
     */
    let data = null;
    try {
        let jsonStr = buf.toString("utf8")
        data = JSON.parse(jsonStr);
    }
    catch (e) {
        console.log("data 解析失敗: " + buf)
        console.log("data 解析失敗: " + buf.toString("utf8"))
        return;
    }
    //驗證
    if (authenticate(s, data.type) == false) {
        console.log("此連線被中斷");
        console.table(s)
        return;
    }

    switch (data.type) {
        case Session.protocolType.authentication:
            /**
             * @type {protocolAuthenticate}
             */
            let reqAuth = JSON.parse(Buffer.from(data.buf).toString("utf8"))
            let playerP = playerCenter.authenticate(reqAuth.account, reqAuth.password);
            playerP.then(player => {
                //重複登入
                let oldS = getSessionByPid(player.aid);
                oldS && oldS.socket.destroy();
                //登入
                s.pid = player.aid;
                s.sendRespond(reqAuth.id, player);
            })
            break;
        case Session.protocolType.request:
            /**
             * @type {prototcolRequest}
             */
            let reqData = JSON.parse(Buffer.from(data.buf).toString("utf8"))

            let server = serversRPC[reqData.server];
            if (server == null) {
                console.log("server is null: " + reqData.server)
                return;
            }
            /**
             * @type {function(...args)}
             */
            let method = server[reqData.method];
            if (method == null) {
                console.log("method is null: " + reqData.method)
                return;
            }
            reqData.args.unshift(s)
            let result = method(...reqData.args);
            if (reqData.id != 0) {
                s.sendRespond(reqData.id, result);
            }
            break;
        case Session.protocolType.respond:
            /**
             * @type {prototcolRespond}
             */
            let resData = JSON.parse(Buffer.from(data.buf).toString("utf8"))
            if (resData.id != 0) {
                let func = s.rpcCallBack[resData.id]
                func && func(resData.data);
            }
            break;
        case Session.protocolType.heartBeat:
            s.sendHeartBeat();
            break;
        default:
            break;
    }
}

/**
 * 判斷是否有驗證(登入)完成
 * 心跳與驗證忽略
 * @param {Session} s 
 * @param {number} type 
 */
function authenticate(s, type) {
    return true
    if (s.pid == 0) {
        return type == Session.protocolType.authentication || type == Session.protocolType.heartBeat
    }
    else return true;
}

/**
 * 新增Session
 * @param {Socket} socket 
 */
function genSession(socket) {
    let s = new Session(socket);
    socket.id = s.id;
    allSession[s.id] = s;
    return s;
}

/**
 * 移除Session
 * @param {Socket} socket 
 */
function removeSession(socket) {
    delete allSession[socket.id];
}

/**
 * id取得Session
 * @param {number} id 
 */
function getSessionById(id) {
    let s = allSession[id];
    if (s == null) console.log("此ID不存在" + id)
    return s;
}

/**
 * id取得Session
 * @param {number} id 
 */
function getSessionByPid(id) {
    let s = Object.values(allSession).find(e => e.pid == id);
    if (s == null) console.log("此PID不存在" + id)
    return s;
}

/**
 * 初始化Manager
 */
function initAllServerRPC() {
    const method = utility.loadAllScript("./server");
    let lsP = [];
    Object.keys(method).forEach(key => {
        if (method[key]['init'] != null) {
            /**
             * @type {Promise}
             */
            let p = method[key]['init']();
            lsP.push(p);
            serversRPC[key] = method[key]['rpc'];
        }
    });
    return Promise.all(lsP);
}

/**
 * 斷線時
 * @param {Socket} socket 
 */
function onClose(socket) {
    let s = allSession[socket.id];
    delete allSession[s.id];
    Object.values(serversRPC).forEach(e => {
        e['onClose'] && e['onClose'](s);
    })
}

module.exports.init = init;
module.exports.parseBuffer = parseBuffer;
module.exports.getSessionById = getSessionById;
module.exports.genSession = genSession;
module.exports.removeSession = removeSession;
module.exports.onClose = onClose;

/**
 * @typedef {import("net").Socket} Socket
 */

/**
 * @typedef protocol
 * @property {number} type
 * @property {Buffer} buf
 */

/**
 * @typedef prototcolRequest
 * @property {number} id
 * @property {string} server
 * @property {string} method
 * @property {[]} args
 */

/**
* @typedef prototcolRespond
* @property {number} id
* @property {*} data
*/

/**
 * @typedef protocolAuthenticate
 * @property {number} id
 * @property {string} account
 * @property {string} password
 */