const Sequelize = require('sequelize');
/**
 * 連線實體
 * @type {Sequelize.Sequelize}
 */
let sequelize = null;
/**
 * 資料庫物件
 * @type {Object.<string,typeof Sequelize.Model>
 */
let modules = {};

/**
 * 
 * @param {object} db
 * @param {string} db.schema
 * @param {string} db.user
 * @param {string} db.password
 * @param {object} db.option //可以不給有預設值
 * @param {string} db.option.host ip
 * @param {string} db.option.dialect 資料庫總類
 * @param {object} db.option.define 相關設定
 * @param {string} db.option.define.charset schema編碼大項
 * @param {string} db.option.define.collate schema編碼細項
 * @param {object} db.option.query 詢問相關設定
 * @param {boolean} db.option.query.raw 回傳為單純資料
 * @param {boolean} db.option.logging consle.log顯示
 * @param {Object<string,{table:*,option:*}>} defindTable 定義Table表格
 */
function connect(db, defindTable) {
    const defaultOption = {
        host: 'localhost',
        dialect: 'mysql',
        define: {
            charset: "utf8",
            collate: "utf8_unicode_ci"
        },
    };
    let option = db.option || defaultOption;
    return testConnect(db.schema, db.account, db.password, option).then(() => {
        sequelize = new Sequelize(db.schema, db.account, db.password, option);
        let p = loadTables(defindTable);//讀取資料表格
        return p;
    }).catch(err => {
        console.error('Unable to connect to the database');
        return Promise.reject(err);
    });
}

/**
 * 測試連線
 * @param {string} database schema名稱
 * @param {string} userName 帳號
 * @param {string} password 密碼
 * @param {Object} option 相關設定
 */
function testConnect(database, userName, password, option) {
    /**
     * @type {Sequelize.Sequelize}
     */
    let testConnect = new Sequelize(null, userName, password, option);
    return testConnect.query("create schema if not exists " + database + ";").then(_ => {
        testConnect.close();
        console.log('Connection has been ' + database + ' successfully.');
    });

}

/**
 * 導入MySQL表單與格式
 * @param {Object} tables { table:Object option:Object }
 */
function loadTables(tables) {
    let p = [];
    Object.keys(tables).forEach(tableName => {
        let option = tables[tableName].option || { timestamps: false, freezeTableName: true };
        modules[tableName] = sequelize.define(tableName, tables[tableName].table, option);
        p.push(modules[tableName].sync());
    })
    return Promise.all(p);
}

function query(command) {
    return sequelize.query(command, { type: Sequelize.QueryTypes.SELECT });
}

module.exports.query = query;
module.exports.op = Sequelize.Op;
module.exports.modules = modules;
module.exports.connect = connect;