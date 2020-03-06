"use strict";
function init() {
    return new Promise((resolve, reject) => {
        console.log("sever初始化");
        resolve()
    })
}

/**
 * 測試用
 * @param {Session} session 
 * @param {*} a 
 * @param {*} b 
 * @param {*} c 
 */
function test(session, a, b, c) {
    console.log(a, b, c);
    return "回傳喔";
}

/**
 * 測試用
 * @param {Session} session 
 * @param {*} a 
 * @param {*} b 
 * @param {*} c 
 */
function testA(session, a, b, c, d) {
    console.log(a, b, c, d);
    return { a, b, c, d };
}

/**
 * 斷線時
 * @param {Session} s
 */
function onClose(s) {

}

module.exports.onClose = onClose;
module.exports.init = init;
module.exports.rpc = {
    test,
    testA
}

/**
 * @typedef {import('../class/session')} Session
 */