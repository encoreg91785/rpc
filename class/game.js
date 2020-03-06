"use strict";
var id;
module.exports = class Game {
    static get status() {
        return {
            /**
             * 載入中
             */
            load: 0,
            /**
             * 選角中
             */
            choiceCharacter: 1,
        }
    }
    /**
     * 
     * @param {number} rId 房间ID
     */
    constructor(rId) {
        id++;
        /**
         * 遊戲編號
         */
        this.id = id;
        /**
         * 房間ID
         */
        this.rId = rId;
        /**
         * 順序
         */
        this.order = [];
        /**
         * 當前操作玩家
         */
        this.currentPlayerIndex = 0;
        /**
         * 遊戲狀態
         */
        this.status = 0;
    }
}