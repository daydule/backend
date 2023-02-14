'use strict';

// eslint-disable-next-line no-unused-vars
const { PoolClient } = require('pg');
const format = require('pg-format');

/**
 * 一括INSERTする
 *
 * @param {PoolClient} client - DB接続
 * @param {string} tableName - 挿入するテーブルの名前
 * @param {string[]} tableColumns - 挿入するするカラム名の配列
 * @param {string[][]} values - 挿入する値の配列の配列
 * @returns {object} result - INSERTの結果
 */
async function bulkInsert(client, tableName, tableColumns, values) {
    const sql = format('INSERT INTO ' + tableName + ' (' + tableColumns.join(', ') + ') VALUES %L RETURNING *', values);
    return await client.query(sql);
}

module.exports = {
    bulkInsert
};
