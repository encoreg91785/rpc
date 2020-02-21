"use strict";
const lobbyCenter = require('../manager/lobbyCenter');
const playerCenter = require('../manager/playerCenter');
function init() {
    return new Promise((resolve, reject) => {
        console.log("sever初始化");
        resolve()
    })
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
 * 進入房間
 * @param {Session} session 
 * @param {number} id 
 * @param {string} lock 
 */
function joinRoom(session, id, lock) {
    let r = lobbyCenter.getRoomById(id);
    if (r != null && r.playerList.length < r.max && r.lock == lock) {
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

module.exports.onClose = onClose;
module.exports.init = init;
module.exports.rpc = {
    inLobby,
    getRoomById,
    joinRoom,
}

/**
 * @typedef {import('../class').Session} Session
 */