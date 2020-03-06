"use strict";
var id;
module.exports = class Room {
    static get status() {
        return {
            /**
             * 準備中
             */
            ready: 0,
            /**
             * 遊戲中
             */
            game: 1,
        }
    }
    static get maxPlayer() {
        return 4;
    }
    /**
     * 
     * @param {string} roomName 房間名
     * @param {number} max 玩家人數限制 2~4
     * @param {string} password 密碼 ""
     */
    constructor(roomName, max, password = "") {
        id++;
        /**
         * 房間編號
         */
        this.id = id;
        /**
         * 房間名稱
         */
        this.roomName = roomName;
        /**
         * 玩家
         * @type {number[]}
         */
        this.playerList = [];
        /**
         * 已準備玩家
         */
        this.isReadyList = [];
        /**
         * 密碼
         */
        this.password = password;
        /**
         * 狀態
         */
        this.status = 0;
        /**
         * 玩家人數上限
         */
        this.max = max;
    }
}