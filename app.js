"use strict";
const socketServer = require("./socketServer/socketServer");
const rpc = require("./rpc/rpc");
const mysql = require("./mysql/mysql");
const defindTable = require("./defindTable");
const httpServer = require("./httpServer/httpServer");
const config = require("./config");
const utility = require('./utility');

init();

async function init() {
    await mysql.connect(config.db, defindTable);
    await loadManager();
    await rpc.init();
    await socketServer.startServer(config.socket.port, onConnect, rpc.parseBuffer);
    await httpServer.startServer(config.http.port)
    console.log("start finish")
}

/**
 * 初始化所有Manager
 */
function loadManager() {
    const api = utility.loadAllScript("./manager");//初始化所有Manager 回傳 Promise
    let p = [];
    Object.keys(api).forEach(key => {
        if (api[key]['init'] != null) {
            p.push(api[key]['init']());
        }
    });
    return Promise.all(p).then(() => {
        console.log("manager初始化");
    });
}

/**
 * 連線後
 * @param {Socket} socket 
 */
function onConnect(socket) {
    rpc.genSession(socket)
    //連線中斷時
    socket.on('end', () => {
        console.log("end");
    });
    //關閉socket
    socket.on("close", (isError) => {
        console.log("close");
    });
    //錯誤時
    socket.on('error', (e) => {
        console.log(e);
    });
    //長時間未回應
    socket.on('timeout', function () {
        socket.destroy();
    });

    socket.on('drain', function () {
        socket.resume();
    });
}


