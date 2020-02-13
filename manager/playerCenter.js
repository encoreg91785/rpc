const authUrl = require("../config").userCenterUrl;
const axios = require("axios").default
const mysql = require("../mysql/mysql");
const Player = require("../class").Player;
const onlinePlayer = {};

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
    if (result[0] != null) p = addPlayer(result[0]);
    return p;
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
    onlinePlayer[data.aid]
    return p;
}

/**
 * 移除玩家資料
 * @param {number} aid 
 */
function removePlayer(aid) {
    delete onlinePlayer[aid];
}

module.exports.authenticate = authenticate;