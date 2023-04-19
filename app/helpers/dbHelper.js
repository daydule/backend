'use strict';

const { Client } = require('pg');

/**
 * @param {string} string - スネークケースの文字列
 * @returns {string} - ローワーキャメルケースの文字列
 */
function transferSnakeCaseToLowerCamelCase(string) {
    return string
        .split('_')
        .map(function (word, index) {
            if (index === 0) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
}

/**
 *
 * @param {object} object - プロパティがスネークケースのオブジェクト
 * @returns {object} - プロパティがローワーキャメルケースのオブジェクト
 */
function transferSnakeCaseObjectToLowerCamelCaseObject(object) {
    const result = {};
    Object.keys(object).forEach((key) => {
        result[transferSnakeCaseToLowerCamelCase(key)] = object[key];
    });
    return result;
}

/**
 * DB操作の処理をラップする
 * DB操作後の戻り値をスネークケースからキャメルケースに変換する
 *
 * @param {Client} client - DB接続
 * @param {string} sql - query文字列
 * @param {Array} values - sql用の引数
 * @returns {object} sqlの実行結果（戻り値がある場合、keyの値はキャメルケースに変換）
 */
async function query(client, sql, values) {
    const result = await client.query(sql, values);
    const convertedResult = result.rows.map((row) => transferSnakeCaseObjectToLowerCamelCaseObject(row));

    result.rows = convertedResult;
    return result;
}

module.exports = {
    query: query,
    transferSnakeCaseToLowerCamelCase,
    transferSnakeCaseObjectToLowerCamelCaseObject
};
