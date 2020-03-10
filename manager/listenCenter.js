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
 * 觸發 丢入Object
 * @param {string} className 
 * @param {number} classId 
 * @param {*} data 
 */
function triggerByObject(className, classId, data) {
    if (className.split('.').length == 1) className = "RPCClass." + className;
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
    var nullLs = [];
    for (let index = 0; index < ls.length; index++) {
        let id = ls[index];
        let s = rpc.getSessionById(id);
        if (s == null) nullLs.push(id);
        
        s && s.sendSyncClass(className, data);
    }
    //移除不存在的Session ID
    for (let index = 0; index < nullLs.length; index++) {
        let id = nullLs[index];
        utility.removeElement(ls,id);
    }
}

/**
 * 觸發丢入class
 * @param {*} classData 
 */
function triggerByClass(classData) {
    let className =classData.constructor.name;
    let classId = classData.id;
    if (className == "Object" || classId == null) {
        console.log("className is error : " + className + "| classId is error: " + classId);
    }
    else triggerByObject(className, classId, classData);
}

module.exports.addListen = addListen;
module.exports.removeListen = removeListen;
module.exports.triggerByObject = triggerByObject;
module.exports.triggerByClass = triggerByClass;
module.exports.init = init;