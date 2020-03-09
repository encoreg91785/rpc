"use strict";
const SyncClass = require("./syncClass");
module.exports = class Player extends SyncClass {
    //设定玩家状态
    static get status() {
        return {
            /**
             * 离线
             */
            offline: 0,
            /**
             * 在大廳內
             */
            lobby: 1,
            /**
             * 房间內
             */
            room: 2,
            /**
             * 游戏內
             */
            game: 3,
        }
    }
    /**
     * 
     * @param {object} data
     * @param {number} data.aid
     * @param {string} data.name
     * @param {number} data.level
     * @param {number} data.exp
     * @param {number} data.gender
     * @param {string} data.photo
     */
    constructor(data) {
        super();
        /**
         * 玩家編號
         */
        this.id = data.aid;
        /**
         * 玩家名稱
         */
        this.name = data.name;
        /**
         * 等級
         */
        this.level = data.level;
        /**
         * 經驗值
         */
        this.exp = data.exp;
        /**
         * 性別
         */
        this.gender = data.gender;
        /**
         * 頭像
         */
        this.photo = data.photo;
        /**
         * 狀態
         */
        this.status = 0;
    }
}