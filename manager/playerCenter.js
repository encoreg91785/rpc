"use strict";
const authUrl = require("../config").userCenterUrl;
const axios = require("axios").default
const mysql = require("../mysql/mysql");
const Player = require("../class").Player;
const lobbyCenter = require("./lobbyCenter");
/**
 * 在線玩家
 * @type {Object<string,Player>}
 */
const onlinePlayer = {};

/**
 * 遊戲中離線玩家
 * @type {Object<string,Player>}
 */
const offlineInGamePlayer = {};

function init() {
    return new Promise(reslove => {
        reslove();
    })
}

/**
 * 登入
 * @param {string} account 
 * @param {string} password 
 */
async function authenticate(account, password) {
    let data = await axios.post(authUrl + "login", { account, password });
    if (data.data.result != "success") return null;
    let ac = data.data.data.account;
    let result = await mysql.modules['player'].findOrCreate({
        where: { aid: ac.id },
        defaults: {
            aid: ac.id,
            name: ac.name,
            gender: ac.sex,
        }
    });
    let p = null;
    if (result[0] != null) {
        p = offlineInGamePlayer[result[0].aid];
        if (p == null) p = addPlayer(result[0]);
        else onlinePlayer[p.aid] = p;
        lobbyCenter.inLobby(p.aid)
    }
    return p;
}

/**
 * 取得在線上的玩家
 * @param {number} id 
 */
function getOnlinePlayer(id) {
    return onlinePlayer[id];
}

/**
 * 新增玩家
 * @param {object} data
 * @param {number} data.aid
 * @param {string} data.name
 * @param {number} data.level
 * @param {number} data.exp
 * @param {number} data.gender
 * @param {string} data.photo
 */
function addPlayer(data) {
    let p = new Player(data);
    onlinePlayer[data.aid] = p;
    return p;
}

/**
 * 移除玩家資料
 * @param {number} id 
 */
function removePlayer(id) {
    let p = onlinePlayer[id];
    if (p != null && p.status == Player.status.game) offlineInGamePlayer[p.aid] = p;
    delete onlinePlayer[id];
}

/**
 * 
 * @param {number} id 
 */
async function getPlayerById(id) {
    let p = onlinePlayer[id];
    if (p == null) {
        p = await mysql.modules['player'].findOne({ where: { aid: id } })
    }
    return p;
}

module.exports.getOnlinePlayer = getOnlinePlayer
module.exports.init = init;
module.exports.authenticate = authenticate;
module.exports.getPlayerById = getPlayerById;
module.exports.removePlayer = removePlayer;