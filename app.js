/**
 * Socket內有id這個值
 */
"use strict";
const fs = require('fs');
const Session = require('./class').Session
const protocolType = {
    /**
     * 請求
     */
    request: 1,
    /**
     * 回應
     */
    respond: 2,
}
var serversRPC = {};
/**
 * 所有Session
 * @type {Object<string,Session>}
 */
const allSession = {};

init();

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

    switch (data.type) {
        case protocolType.request:
            /**
             * @type {prototcolRequest}
             */
            let reqData = JSON.parse(data.buf.toString("utf8"))

            let server = serversRPC[reqData.server];
            if (server == null) {
                console.log("server is null: " + reqData.server)
                return;
            }
            /**
             * @type {function(...args)}
             */
            let method = server['rpc'][reqData.method];
            if (method == null) {
                console.log("method is null: " + reqData.method)
                return;
            }
            let result = method(...reqData.args);
            if (reqData.id != 0) {
                let s = getSessionById(socket.id);
                s.sendRespond(reqData.id, result);
            }
            break;
        case protocolType.respond:
            /**
             * @type {prototcolRespond}
             */
            let reqData = JSON.parse(data.buf.toString("utf8"))
            if (data.id != 0) {
                let s = getSessionById(socket.id);
                s.rpcCallBack[data.id](reqData);
            }
            break;
        default:
            break;
    }
}

/**
 * 新增Session
 * @param {Socket} socket 
 */
function addSession(socket) {
    let s = new Session(socket);
    socket.id = s.id;
    allSession[s.id] = s;
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
    if (s) console.log("此ID不存在" + id)
    return s;
}

/**
 * 初始化Manager
 */
function initAllServerRPC() {
    const method = loadAllScript("./manager");
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
 * 讀取路徑下所有js
 * 將方法裝成Object回傳
 * @param {string} path
 * @return {{string:function}}
 */
function loadAllScript(path) {
    var methods = {};
    if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);
        files.forEach(file => {
            var filename = file.split(".")[0];
            methods[filename] = require("../" + path + '/' + file);
        })
        return methods;
    }
    else return {};
}

module.exports.init = init;
module.exports.parseBuffer = parseBuffer;
module.exports.getSessionById = getSessionById;
module.exports.addSession = addSession;
module.exports.removeSession = removeSession;

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