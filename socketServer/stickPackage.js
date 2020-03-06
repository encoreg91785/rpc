/**
 * 拚黏資料與配置傳送資料
 */
class StickPackage {
    //#region header 相關數值
    /**
     * 資料長度(佔用空間)
     * max uint 4,294,967,295
     */
    static get totalSize() {
        return 4;
    }
    //#endregion 

    /**
     * 設定傳送資料
     * @param {Buffer} bufData 資料物件
     */
    static setSendData(bufData) {
        let total = this.totalSize + bufData.length;//資料總長度+header長度
        if (total <= 512 * 1024 * 1024) {
            let buf = Buffer.allocUnsafe(this.totalSize);//new Buffer
            buf.writeInt32LE(total, 0);
            return Buffer.concat([buf, bufData]);
        }
        else {
            console.log("data is bigger over 0.5G");
            return null;
        }
    }

    /**
     * 初始化
     * @param {Socket} socket 
     */
    constructor(socket) {
        /**
          * 完成時的CallBack
          * @param {Buffer} buf buffer
          */
        this.onCompleteCallBack = function (socket, buf) { };
        /**
         * 是否正在拚黏Header
         */
        this.combineHeader = false;
        /**
         * 是否正在拚黏Body
         */
        this.combineBody = false;
        /**
         * 偏移
         */
        this.offset = 0;
        /**
         * @type {Buffer}
         */
        this.stickBuffer = null;
        /**
         * @type {Socket}
         */
        this.socket = socket;
    }

    /**
     * 拚黏資料
     * @param {Buffer} buf 
     */
    stick(buf) {
        //是否正在拚黏
        if (this.combineBody || this.combineHeader) {
            let subtract = this.stickBuffer.length - this.offset;
            if (buf.length < subtract) {
                buf.copy(this.stickBuffer, this.offset);
                this.offset += buf.length;
            }
            else {
                //拚黏Body
                if (this.combineBody && !this.combineHeader) {
                    buf.copy(this.stickBuffer, this.offset, 0, subtract);
                    this.onCompleteCallBack(this.socket, this.stickBuffer.slice(4));
                    this.combineBody = false;

                    if (buf.length - subtract > 0) {
                        this.stick(buf.slice(subtract));
                    }
                }
                //拚黏Header
                else {
                    this.stickBuffer = Buffer.concat([this.stickBuffer.slice(0, subtract), buf]);
                    this.combineHeader = false;
                    this.stick(this.stickBuffer);
                }
            }
        }
        else {
            if (buf.length >= StickPackage.totalSize) {
                //讀取總長度
                let total = buf.readUInt32LE(0);
                if (buf.length == total) {
                    //已取得全部資料
                    this.onCompleteCallBack(this.socket, buf.slice(4));
                }
                else if (buf.length < total) {
                    //開始拚黏所有資料
                    this.combineBody = true;
                    this.stickBuffer = Buffer.allocUnsafe(total);
                    this.offset = 0;
                    buf.copy(this.stickBuffer);
                    this.offset += buf.length;
                }
                else {
                    //拚黏完成
                    this.onCompleteCallBack(this.socket, buf.slice(4,total));
                    if (total < buf.length) this.stick(buf.slice(total));
                }
            }
            else {
                //使拚黏header
                this.combineHeader = true;
                this.stickBuffer = Buffer.allocUnsafe(4);
                this.offset = 0;
                buf.copy(this.stickBuffer, this.offset);
                this.offset += buf.length;
            }
        }
    }
}
module.exports = StickPackage;

/**
 * @typedef {import('net').Socket} Socket
 */