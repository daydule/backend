'use strict';

const constant = require('../config/const');
const dbHelper = require('../helpers/dbHelper');
const { PLAN_TYPE } = require('../config/const');
const { Client } = require('pg');

/**
 * 今日最初の呼び出しの場合に初期化する
 *
 * @param {Client} client - DB接続
 * @param {boolean} isGuest - ゲストかどうか
 * @param {number} userId - ユーザーID
 * @param {Date} date - 日付
 */
async function initSchedule(client, isGuest, userId, date) {
    const getSchedulesResult = await dbHelper.query(
        client,
        'SELECT * FROM schedules WHERE user_id = $1 AND date = $2',
        [userId, date]
    );
    if (getSchedulesResult.rows.length > 0) {
        return;
    }

    if (isGuest) {
        await dbHelper.query(
            client,
            'INSERT INTO schedules (user_id, date, start_time, end_time) VALUES ($1, $2, $3, $4)',
            [userId, date, constant.DEFAULT.SCHEDULE.START_TIME, constant.DEFAULT.SCHEDULE.END_TIME]
        );
        return;
    }

    const getDaySettingsResult = await dbHelper.query(
        client,
        'SELECT * FROM day_settings WHERE user_id = $1 AND day = $2',
        [userId, date.getDay()]
    );
    await dbHelper.query(
        client,
        'INSERT INTO schedules (user_id, date, start_time, end_time) VALUES ($1, $2, $3, $4)',
        [userId, date, getDaySettingsResult.rows[0].scheduleStartTime, getDaySettingsResult.rows[0].scheduleEndTime]
    );
    const getRecurringPlansResult = await dbHelper.query(client, 'SELECT * FROM recurring_plans WHERE day_id = $1', [
        getDaySettingsResult.rows[0].id
    ]);

    await Promise.all(
        getRecurringPlansResult.rows.map(async (recurringPlan) => {
            await dbHelper.query(
                client,
                'INSERT INTO plans (\
                        user_id, title, context, date, start_time, end_time, travel_time, buffer_time, plan_type, \
                        priority, place, is_required_plan) \
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
                [
                    userId,
                    recurringPlan.title,
                    recurringPlan.context,
                    date,
                    recurringPlan.startTime,
                    recurringPlan.endTime,
                    recurringPlan.travelTime,
                    recurringPlan.bufferTime,
                    PLAN_TYPE.PLAN,
                    recurringPlan.priority,
                    recurringPlan.place,
                    true
                ]
            );
        })
    );
}

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
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        };
    }
}

module.exports = {
    initSchedule,
    createSchedule
};
