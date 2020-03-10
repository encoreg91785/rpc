"use strict";
const authUrl = require("../config").userCenterUrl;
const axios = require("axios").default
const mysql = require("../mysql/mysql");
const Player = require("../class/player");

/**
 * 在線玩家
 * @type {Object<string,Player>}
 */
const onlinePlayer = {};

/**
 * 離線玩家
 * @type {Object<string,Player>}
 */
const offlineInGamePlayer = {};

function init() {
    return new Promise(reslove => {
        reslove();
    }).then(_ => {
        return authenticate("Q", "Q");
    })
}

/**
 * 登入
 * @param {string} account 
 * @param {string} password 
 */
async function authenticate(account, password) {
    try {
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
            else {
                onlinePlayer[p.id] = p;
                p.status = Player.status.game;
                p.update();
            }
        }
        return p;
    }
    catch (e) {
        console.log(e);
        return null;
    }

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
    if (p != null && p.status == Player.status.game) {
        offlineInGamePlayer[p.aid] = p;
    }
    p.status = Player.status.offline;
    p.update();
    delete onlinePlayer[id];
}

/**
 * 取得玩家資資訊
 * @param {number} id 
 */
async function getPlayerById(id) {
    let p = onlinePlayer[id];
    if (p == null) {
        let pData = await mysql.modules['player'].findOne({ where: { aid: id } })
        p = new Player(pData);
    }
    return p;
}

/**
 * 抓取所有在線玩家ID
 * @param {number} t null為全部 player status 
 */
function getAllOnlinePlayer(t) {
    let allPlayerId = Object.keys(onlinePlayer);
    if (t != null) {
        allPlayerId = allPlayerId.filter(e => {
            return onlinePlayer[e].status == t;
        })
    }
    return allPlayerId
}

module.exports.getOnlinePlayer = getOnlinePlayer;
module.exports.init = init;
module.exports.authenticate = authenticate;
module.exports.getPlayerById = getPlayerById;
module.exports.removePlayer = removePlayer;
module.exports.getAllOnlinePlayer = getAllOnlinePlayer;