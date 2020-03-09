/**
 * Socket內有id這個值
 */
"use strict";
const Session = require('../class').Session
const utility = require('../utility');
const playerCenter = require('../manager/playerCenter');
const listenCenter = require('../manager/listenCenter');
var serversRPC = {};
/**
 * @type {Object<string,number[]>}
 */
const listenMethodList = {};
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
        let jsonStr = Buffer.from(buf, 'base64').toString("utf8");
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
        console.table(s.id, socket.id)
        return;
    }
    switch (data.type) {
        case Session.protocolType.authentication:
            /**
             * @type {protocolAuthenticate}
             */
            let reqAuth = JSON.parse(Buffer.from(data.buf, 'base64').toString("utf8"))
            logger(s.id, data.type, reqAuth);
            let playerP = playerCenter.authenticate(reqAuth.account, reqAuth.password);
            playerP.then(player => {
                if (player != null) {
                    //重複登入
                    let oldS = getSessionByPid(player.id);
                    oldS && oldS.socket.destroy();
                    //登入
                    s.pid = player.id;
                }
                s.sendRespond(reqAuth.id, player);
            })
            break;
        case Session.protocolType.request:
            /**
             * @type {protocolRequest}
             */
            let reqData = JSON.parse(Buffer.from(data.buf, 'base64').toString("utf8"))
            let server = serversRPC[reqData.server];
            if (server == null) {
                console.log("server is null: " + reqData.server + "." + reqData.method)
                return;
            }
            /**
             * @type {function(...args)}
             */
            let method = server['rpc'][reqData.method];
            if (method == null) {
                console.log("method is null: " + reqData.server + "." + reqData.method)
                return;
            }
            if (reqData.args == null) reqData.args = [];
            logger(s.id, data.type, reqData);
            reqData.args.unshift(s)
            let result = method(...reqData.args);
            if (reqData.id != 0) {
                s.sendRespond(reqData.id, result);
            }
            let delSidList =[]
            let sls = listenMethodList[reqData.server+"."+reqData.method]||[];
            //監聽方法回傳
            for (let index = 0; index < sls.length; index++) {
                let id = sls[index];
                let ss = getSessionById(id);
                if(ss!=null)ss.sendMethodReturn(reqData.server,reqData.method,result);
                else delSidList.push(id);
            }
            //移除不存在Session ID
            for (let index = 0; index < delSidList.length; index++) {
                let id = delSidList[index];
                utility.removeElement(sls,id);
            }

            break;
        case Session.protocolType.respond:
            /**
             * @type {protocolRespond}
             */
            let resData = JSON.parse(Buffer.from(data.buf, 'base64').toString("utf8"))
            logger(s.id, data.type, reqAuth);
            if (resData.id != 0) {
                let func = s.rpcCallBack[resData.id]
                func && func(resData.data);
            }
            break;
        case Session.protocolType.listenClass:
            /**
             * @type {protocolListenClass}
             */
            let lisData = JSON.parse(Buffer.from(data.buf, 'base64').toString("utf8"));
            if (lisData.add) {
                listenCenter.addListen(lisData.className, lisData.classId, s.id)
            }
            else {
                listenCenter.removeListen(lisData.className, lisData.classId, s.id)
            }
            logger(s.id, data.type, lisData);
            if (lisData.id != 0) s.sendRespond(lisData.id);
            break;
        case Session.protocolType.listenMethod:
            /**
             * @type {protocolListenMethod}
             */
            let lisMethod = JSON.parse(Buffer.from(data.buf, 'base64').toString("utf8"));
            let methodKey = lisMethod.server+"."+lisMethod.method;
            if(lisMethod.add){
                if(listenMethodList[methodKey] ==null) listenMethodList[methodKey] = [];
                listenMethodList[methodKey].push(s.id);
            }
            else{
                if(listenMethodList[methodKey] !=null)utility.removeElement(listenMethodList[methodKey],s.id);
            }
            logger(s.id, data.type, lisMethod);
            if (lisMethod.id != 0) s.sendRespond(lisMethod.id);
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
            serversRPC[key] = method[key];
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

function logger(sId, type, data) {
    if (type != Session.protocolType.heartBeat) {
        let str = sId + ":RPC接受---" + Object.keys(Session.protocolType).find(e => Session.protocolType[e] == type);
        str += " :: data : " + JSON.stringify(data);
        console.log(str)
    }
}

module.exports.init = init;
module.exports.parseBuffer = parseBuffer;
module.exports.getSessionById = getSessionById;
module.exports.getSessionByPid = getSessionByPid;
module.exports.genSession = genSession;
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
 * @typedef protocolRequest
 * @property {number} id
 * @property {string} server
 * @property {string} method
 * @property {[]} args
 */

/**
* @typedef protocolRespond
* @property {number} id
* @property {*} data
*/

/**
* @typedef protocolListenClass
* @property {number} id
* @property {number} classId
* @property {string} className
* @property {boolean} add
*/

/**
 * @typedef protocolAuthenticate
 * @property {number} id
 * @property {string} account
 * @property {string} password
 */

 /**
 * @typedef protocolListenMethod
 * @property {number} id
 * @property {string} server
 * @property {string} method
 * @property {boolean} add
 */