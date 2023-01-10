'use strict';

const constant = require('../config/const');

/**
 * スケジュールを作成する
 *
 * @param {object} pool - DB接続
 * @param {number} scheduleLogicId - ロジックID
 * @param {number} userId - ユーザーID
 * @param {number} scheduleId - スケジュールID
 * @param {string} startTime - スケジュール開始時間
 * @param {string} endTime - スケジュール終了時間
 * @param {Array} plans - 予定
 * @param {Array} todos - TODO
 * @returns {object} - スケジュール作成結果
 */
async function createSchedule(pool, scheduleLogicId, userId, scheduleId, startTime, endTime, plans, todos) {
    let scheduleLogic;
    try {
        scheduleLogic = require('./schedule/' + constant.SCHEDULE_LOGIC_FILENAME[scheduleLogicId]);
    } catch (e) {
        return {
            isError: true
        };
    }

    const result = await scheduleLogic.execute(
        pool,
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
}

module.exports = {
    createSchedule: createSchedule
};
