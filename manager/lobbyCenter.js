"use strict";
const Room = require('../class/room');
const utility = require('../utility');

/**
 * @type {Object<string,Room>}
 */
const allRoom = {};

function init() {
    return new Promise(reslove => {
        reslove();
    })
}

/**
 * 創房間
 * @param {string} roomName 房間名
 * @param {number} max 最大人數 2~4
 * @param {string} password 密碼
 */
function creatRoom(roomName, max, password = "") {
    max = max > Room.maxPlayer ? Room.maxPlayer : (max < Room.minPlayer ? Room.minPlayer : max);
    let r = new Room(roomName, max, password)
    allRoom[r.id] = r;
    return r;
}

/**
 * 加入房間
 * @param {number} roomId 
 * @param {number} pid 
 * @param {string} password 
 */
function joinRoom(roomId, pid, password = "") {
    let r = getRoomById(roomId);
    if (r != null && r.status == Room.status.ready && //不為Null 狀態為準備中
        r.playerList.length < r.max && r.password == password) {//檢查人數/密碼
        if( r.playerList.includes(pid) == false) r.playerList.push(pid); //是否重複進入
        return true;
    }
    else return false;
}

/**
 * 離開房間
 * @param {number} roomId 
 * @param {number} pid 
 */
function leaveRoom(roomId, pid) {
    let r = getRoomById(roomId);
    if (r != null && r.status == Room.status.ready) {
        utility.removeElement(r.playerList, pid);
        utility.removeElement(r.isReadyList, pid);
        if (r.playerList.length == 0) {
            deleteRoom(roomId);
        }
    }
}

/**
 * 準備/取消準備
 * @param {number} roomId 
 * @param {number} pid 
 */
function isReady(roomId, pid) {
    let r = getRoomById(roomId);
    if (r != null && r.status == Room.status.ready && r.playerList.includes(pid)) {
        if (r.isReadyList.includes(pid)) {
            utility.removeElement(r.isReadyList, pid)
        }
        else r.isReadyList.push(pid);
        return true;
    }
    else return false;
}

/**
 * 
 * @param {number} roomId 
 */
function inGame(roomId) {
    let r = getRoomById(roomId);
    if (r != null && r.status == Room.status.ready && //檢查是否為Null 狀態是否是準備中
        r.playerList.length <= r.max && //檢查玩家人數是否大於等於最小人數
        r.isReadyList.length == r.playerList.length) { //是否全部人都已準備
        r.status = Room.status.game;
        return true;
    }
    return false;
}

function leaveGame(roomId) {
    let r = getRoomById(roomId);
    if (r != null && r.status == Room.status.game) { //檢查是否為Null 狀態是否是準備中
        r.status = Room.status.ready;
        return true;
    }
    else return false;
}


function deleteRoom(roomId) {
    let r = getRoomById(roomId);
    if (r != null && r.status == Room.status.ready){
        delete allRoom[roomId];
    }
}

/**
 * 
 * @param {number} id 
 */
function getRoomById(id) {
    let r = allRoom[id];
    return r;
}

/**
 * 取得所有在大廳的RoomID
 */
function getLobbyAllRoomId() {
    return Object.keys(allRoom);
}

module.exports.getLobbyAllRoomId = getLobbyAllRoomId;

module.exports.getRoomById = getRoomById;
module.exports.creatRoom = creatRoom;
module.exports.joinRoom = joinRoom;
module.exports.isReady = isReady;
module.exports.leaveRoom = leaveRoom;
module.exports.deleteRoom = deleteRoom;

module.exports.startGame = inGame;
module.exports.leaveGame = leaveGame;

module.exports.init = init;

