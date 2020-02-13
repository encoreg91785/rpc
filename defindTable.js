"use strict";
const Sequelize = require('sequelize');
/**
 * 資料庫定義
 */
const defineTables = {
    player: {
        table: {
            aid: { type: Sequelize.INTEGER, primaryKey: true },
            name: { type: Sequelize.STRING(50), unique: true, allowNull: false },
            level: { type: Sequelize.INTEGER, defaultValue: 1 },
            exp: { type: Sequelize.INTEGER, defaultValue: 0 },
            gender: { type: Sequelize.SMALLINT, allowNull: true },
            photo: { type: Sequelize.STRING(50) },
            createAt: { type: Sequelize.DATE },
            lastLogin: { type: Sequelize.DATE },
        },
        option: {
            timestamps: false,
            updatedAt: false,
            freezeTableName: true
        },
    },
}

module.exports = defineTables;