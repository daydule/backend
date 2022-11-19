'use strict';

const { Pool } = require('pg');
const DEFAULT = require('../const').DEFAULT;
const DAY_LIST = require('../const').DAY_LIST;

/**
 * 曜日別設定の初期設定をする
 *
 * @param {Pool} pool - DB接続
 * @param {string} userId - 初期設定をするユーザーのID
 * @returns {void}
 */
async function initDaySettings(pool, userId) {
    const sql =
        'INSERT INTO day_settings (user_id, setting_name, day, schedule_start_time, schedule_end_time, scheduling_logic)' +
        'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    for (let i = 0; i < DAY_LIST.length; i++) {
        const params = [
            userId,
            DAY_LIST[i],
            i,
            DEFAULT.DAY_SETTINGS.SCHEDULE_START_TIME,
            DEFAULT.DAY_SETTINGS.SCHEDULE_END_TIME,
            0
        ];
        await pool.query(sql, params);
    }
}

module.exports = {
    initDaySettings: initDaySettings
};
