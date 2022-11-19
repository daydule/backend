'use strict';

const { Pool } = require('pg');
const DEFAULT = require('../constants').DEFAULT;
const DAY_LIST = require('../constants').DAY_LIST;

/**
 * 曜日別設定の初期設定をする
 *
 * @param {Pool} pool - DB接続
 * @param {string} userId - 初期設定をするユーザーのID
 * @returns {object} - 設定をした個別曜日レコード
 */
async function initDaySettings(pool, userId) {
    const sql =
        'INSERT INTO day_settings (user_id, setting_name, day, schedule_start_time, schedule_end_time, scheduling_logic)' +
        'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    let daySettingList = [];
    for (let i = 0; i < DAY_LIST.length; i++) {
        const params = [
            userId,
            DAY_LIST[i],
            i,
            DEFAULT.DAY_SETTINGS.SCHEDULE_START_TIME,
            DEFAULT.DAY_SETTINGS.SCHEDULE_END_TIME,
            0
        ];
        const result = await pool.query(sql, params);
        daySettingList[i] = result.rows[0];
    }
    return daySettingList.map((daySetting) => {
        return {
            userId: daySetting.user_id,
            settingName: daySetting.setting_name,
            day: daySetting.day,
            scheduleStartTime: daySetting.schedule_start_time,
            scheduleEndTime: daySetting.schedule_end_time,
            schedulingLogic: daySetting.scheduling_logic
        };
    });
}

module.exports = {
    initDaySettings: initDaySettings
};
