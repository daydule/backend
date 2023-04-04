'use strict';

const constant = require('../config/const');
const { Client } = require('pg');

/**
 * スケジュールを作成する
 *
 * @param {Client} client - DB接続
 * @param {number} scheduleLogicId - ロジックID
 * @param {number} userId - ユーザーID
 * @param {number} scheduleId - スケジュールID
 * @param {string} startTime - スケジュール開始時間
 * @param {string} endTime - スケジュール終了時間
 * @param {Array} plans - 予定
 * @param {Array} todos - TODO
 * @param {string} date - 日付
 * @returns {object} - スケジュール作成結果
 */
async function createSchedule(client, scheduleLogicId, userId, scheduleId, startTime, endTime, plans, todos, date) {
    try {
        const scheduleLogic = require('./schedule/' + constant.SCHEDULE_LOGIC_FILENAME[scheduleLogicId]);
        const result = await scheduleLogic.execute(client, userId, scheduleId, startTime, endTime, plans, todos, date);
        return {
            isError: false,
            result: result
        };
    } catch (e) {
        console.error(e);

        return {
            isError: true,
            errorId: 'serverError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        };
    }
}

module.exports = {
    createSchedule
};
