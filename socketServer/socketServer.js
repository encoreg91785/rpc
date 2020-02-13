"use strict";
const net = require('net');
const StickPackage = require("./stickPackage");
/**
 * @type {net.Server}
 */
let server;

/**
 * @param {number} port 
 * @param {onConnectCallBack} onConnect 
 * @param {onDataCallBack} onData 
 */
function startServer(port, onConnect, onData) {
    var p = new Promise((resolve, reject) => {
        server = net.createServer();
        server.on('connection', (socket) => {
            let stickPackage = new StickPackage(socket);
            stickPackage.onCompleteCallBack = onData;
            onConnect(socket);
            console.log("connection");
            /**
             * 拚黏封包物件
             */
            socket.on('data', (buf) => {
                stickPackage.stick(buf);
            });
        });
        server.listen({ port: port }, () => {
            console.log("Socket Server Run");
            resolve();
        });//启动监听  
    });
    return p;
}

module.exports.startServer = startServer;

/**
 * @callback onConnectCallBack
 * @param {net.Socket} socket
 * @returns {void}
 */

/**
* @callback onDataCallBack 
* @param {net.Socket} socket
* @param {Buffer} buf
* @returns {void}
*/