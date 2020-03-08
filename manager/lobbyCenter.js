"use strict";
const Room = require('../class').Room
/**
 * @type {Object<string,number>}
 */
const inLobbyPlayerId = {};
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
    max = max > 4 ? 4 : (max < 2 ? 2 : max);
    let r = new Room(roomName, max, password)
    allRoom[r.id] = r;
    return r;
}

/**
 * 進入大廳
 * @param {number} id Player ID 
 */
function inLobby(id) {
    inLobbyPlayerId[id] = id;
}

/**
 * 離開大廳(離線/進入房間)
 * @param {number} id Player ID 
 */
function leaveLobby(id) {
    delete inLobbyPlayerId[id];
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
 * 取得所有在大廳的PlayerID
 */
function getLobbyAllPlayerId() {
    return Object.keys(inLobbyPlayerId);
}

/**
 * 取得所有在大廳的RoomID
 */
function getLobbyAllRoomId() {
    return Object.keys(allRoom);
}

module.exports.getLobbyAllRoomId = getLobbyAllRoomId;
module.exports.getLobbyAllPlayerId = getLobbyAllPlayerId;
module.exports.getRoomById = getRoomById;
module.exports.creatRoom = creatRoom;
module.exports.inLobby = inLobby;
module.exports.leaveLobby = leaveLobby;
module.exports.init = init;

