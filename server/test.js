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
function test(session,a, b, c) {
    console.log(a, b, c);
    return "回傳喔";
}

module.exports.init = init;
module.exports.rpc = {
    test
}

/**
 * @typedef {import('../class/session')} Session
 */