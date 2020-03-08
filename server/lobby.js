"use strict";
const lobbyCenter = require('../manager/lobbyCenter');
const playerCenter = require('../manager/playerCenter');
const listenCenter = require("../manager/listenCenter");

function init() {
    return new Promise((resolve, reject) => {
        console.log("sever初始化");
        resolve()
    })
}

function testt() {
    lobbyCenter.creatRoom("測試1號", 4)
}

/**
 * 進入大廳
 * @param {Session} session 
 */
function inLobby(session) {
    let idList = lobbyCenter.getLobbyAllRoomId()
    lobbyCenter.inLobby(session.pid);
    return idList;
}

/**
 * 取得房間資訊
 * @param {Session} session 
 */
function getRoomById(session, id) {
    let r = lobbyCenter.getRoomById(id)
    return r;
}

/**
 * 
 * @param {Session} session 
 * @param {string} roomName
 * @param {number} max
 * @param {string} password 
 */
function createRoom(session, roomName, max, password) {
    var r = lobbyCenter.creatRoom(roomName, max, password);
    return r;
}

/**
 * 進入房間
 * @param {Session} session 
 * @param {number} id 
 * @param {string} password 
 */
function joinRoom(session, id, password) {
    let r = lobbyCenter.getRoomById(id);
    if (r != null && r.playerList.length < r.max && r.password == password) {
        r.playerList.push(session.pid);
        return true;
    }
    return false;
}

/**
 * 斷線時
 * @param {Session} s
 */
function onClose(s) {
    lobbyCenter.leaveLobby(s.pid);
    let p = playerCenter.getOnlinePlayer(s.pid)
    if (p != null) playerCenter.removePlayer(p.aid);
}
/**
 * 進入房間
 * @param {Session} session 
 */
function test(session){
    let p = playerCenter.getOnlinePlayer(session.pid);
    p.name = "QQQQ";
    listenCenter.triggerByClass(p);
}

module.exports.onClose = onClose;
module.exports.init = init;
module.exports.rpc = {
    inLobby,
    getRoomById,
    joinRoom,
    createRoom,
    test
}

/**
 * @typedef {import('../class').Session} Session
 */