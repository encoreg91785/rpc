"use strict";
const utility = require('../utility')
const rpc = require('../rpc/rpc');
/**
 * className classId socketId[]
 * @type {Object<string,Object<number,number[]>>}
 */
const listenList = {}
/**
 * 初始化
 */
function init() {
    return new Promise((resolve, reject) => {
        resolve()
    })
}

/**
 * 移除監聽
 * @param {string} className 
 * @param {number} classId 
 * @param {number} id socketID
 */
function removeListen(className, classId, id) {
    let objLs = listenList[className];
    if (objLs != null) {
        objLs = {};
        listenList[className] = objLs;
    }
    let ls = objLs[classId]
    if (ls == null) {
        ls = []
        objLs[classId] = ls
    }
    utility.removeElement(ls, id);
}

/**
 * 加入監聽
 * @param {string} className 
 * @param {number} classId 
 * @param {number} id socketID 
 */
function addListen(className, classId, id) {
    let objLs = listenList[className];
    if (objLs == null) {
        objLs = {};
        listenList[className] = objLs;
    }
    let ls = objLs[classId]
    if (ls == null) {
        ls = []
        objLs[classId] = ls
    }
    if (ls.includes(id) == false) ls.push(id);
    else { console.log("(" + className + classId + ") PlayerID: " + id + "重複監聽了") }
}

/**
 * 觸發
 * @param {string} className 
 * @param {number} classId 
 * @param {*} data 
 */
function trigger(className, classId, data) {
    let objLs = listenList[className];
    if (objLs == null) {
        objLs = {};
        listenList[className] = objLs;
    }
    let ls = objLs[classId]
    if (ls == null) {
        ls = []
        objLs[classId] = ls
    }
    for (let index = 0; index < ls.length; index++) {
        let id = ls[index];
        let s = rpc.getSessionById(id);
        s.sendSyncClass(className, classId, data);
    }
}

module.exports.addListen = addListen;
module.exports.removeListen = removeListen;
module.exports.trigger = trigger;
module.exports.init = init;