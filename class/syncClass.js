const listenCenter = require("../manager/listenCenter");
module.exports = class SyncClass{
    /**
     * 同步更新給所有監聽的客戶端
     */
    update(){
        listenCenter.triggerByClass(this);
    }
} 