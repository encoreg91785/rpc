"use strict";
module.exports = class Player {
    static get status() {
        return {
            /**
             * 無狀態
             */
            none: 0,
            /**
             * 在大廳內
             */
            lobby: 1,
            /**
             * 遊戲內
             */
            game: 2,
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
        /**
         * 玩家編號
         */
        this.aid = data.aid;
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