"use strict";
const lobbyCenter = require('../manager/lobbyCenter');
const playerCenter = require('../manager/playerCenter');
const listenCenter = require("../manager/listenCenter");
const Player = require("../class/player");
const Room = require("../class/room");

function init() {
    return new Promise((resolve, reject) => {
        console.log("sever初始化");
        resolve()
    })
}

/**
 * 進入大廳
 * @param {Session} session 
 * @returns 所有房間ID
 */
function inLobby(session) {
    let p = playerCenter.getOnlinePlayer(session.pid);
    p.status = Player.status.lobby;
    listenCenter.triggerByClass(p);
    return lobbyCenter.getLobbyAllRoomId();
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
 * @param {Session} session 
 * @param {string} roomName
 * @param {number} max
 * @param {string} password 
 */
function createAndJoinRoom(session, roomName, max, password) {
    var r = lobbyCenter.creatRoom(roomName, max, password);
    joinRoom(session, r.id, password);
    return r;
}

/**
 * 進入房間
 * @param {Session} session 
 * @param {number} rid 
 * @param {string} password 
 */
function joinRoom(session, rid, password) {
    let isIn = lobbyCenter.joinRoom(rid, session.pid, password);
    if (isIn) {
        let r = lobbyCenter.getRoomById(rid);
        r.update();

        let p = playerCenter.getOnlinePlayer(session.pid);
        p.status = Player.status.room;
        p.update();
    }
    return isIn;
}

/**
 * 房間內準備完成
 * @param {Session} s 
 * @param {number} rid 
 */
function onReady(s, rid) {
    let isOn = lobbyCenter.isReady(rid, s.pid)
    if (isOn) {
        let r = lobbyCenter.getRoomById(rid);
        r.update();
    }
    return isOn;
}

/**
 * 離開房間
 * @param {Session} s 
 * @param {number} rid 
 */
function leaveRoom(s, rid) {
    let isOn = lobbyCenter.leaveRoom(rid, s.pid)
    if (isOn) {
        let r = getRoomById(rid);
        r.update();
        let p = playerCenter.getOnlinePlayer(session.pid);
        p.status = Player.status.lobby;
        p.update();
        if (r.playerList.length == 0) lobbyCenter.deleteRoom(rid);
    }
    return isOn;
}

/**
 * 房間開始遊戲
 * @param {Session} s 
 * @param {number} rid 
 */
function inGame(s, rid) {
    let isOn = lobbyCenter.startGame(rid, s.pid)
    if (isOn) {
        let r = lobbyCenter.getRoomById(rid);
        r.update();
        r.playerList.forEach(pid => {
            let p = playerCenter.getOnlinePlayer(pid);
            p.status = Player.status.game;
            p.update();
        })
    }
    return isOn;
}

/**
 * 斷線時
 * @param {Session} s
 */
function onClose(s) {
    let p = playerCenter.getOnlinePlayer(s.pid);
    let ids = lobbyCenter.getLobbyAllRoomId();
    for (let index = 0; index < ids.length; index++) {
        let rid = ids[index];
        let r = lobbyCenter.getRoomById(rid);
        if (r.status == Room.status.ready && r.playerList.includes(s.pid)) {
            leaveRoom(s, r.id);
            break;
        }
    }
    if (p != null) {
        playerCenter.removePlayer(p.id);
    }
}

module.exports.onClose = onClose;
module.exports.init = init;
module.exports.rpc = {
    inLobby,
    getRoomById,
    createAndJoinRoom,
    joinRoom,
    leaveRoom,
    onReady,
    inGame,
}

/**
 * @typedef {import('../class').Session} Session
 */