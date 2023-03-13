'use strict';

const constant = require('../config/const');

/**
 * スケジュールを作成する
 *
 * @param {object} client - DB接続
 * @param {number} scheduleLogicId - ロジックID
 * @param {number} userId - ユーザーID
 * @param {number} scheduleId - スケジュールID
 * @param {string} startTime - スケジュール開始時間
 * @param {string} endTime - スケジュール終了時間
 * @param {Array} plans - 予定
 * @param {Array} todos - TODO
 * @returns {object} - スケジュール作成結果
 */
async function createSchedule(client, scheduleLogicId, userId, scheduleId, startTime, endTime, plans, todos) {
    try {
        const scheduleLogic = require('./schedule/' + constant.SCHEDULE_LOGIC_FILENAME[scheduleLogicId]);
        const result = await scheduleLogic.execute(
            client,
            userId,
            scheduleLogicId,
            scheduleId,
            startTime,
            endTime,
            plans,
            todos
        );
        return {
            isError: false,
            result: result
        };
    } catch (e) {
        console.error(e);

        return {
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        };
    }
}

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

module.exports = {
    createSchedule,
    transferSnakeCaseToLowerCamelCase,
    transferSnakeCaseObjectToLowerCamelCaseObject
};
