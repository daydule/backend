'use strict';

/**
 * 曜日別設定の初期設定をする
 *
 * @param {import("pg").PoolClient} client - DB接続
 * @param {string} userId - 初期設定するユーザーのID
 * @returns {void}
 */
async function initDaySettings(client, userId) {
    const dayList = ['日', '月', '火', '水', '木', '金', '土'];
    for (let i = 0; i < dayList.length; i++) {
        const sql =
            'INSERT INTO day_settings (user_id, setting_name, day, schedule_start_time, schedule_end_time, scheduling_logic) VALUES ($1, $2, $3, $4, $5, $6)';
        const params = [userId, dayList[i] + '曜日', i, '09:00', '18:00', 0];
        await client.query(sql, params);
    }
}

module.exports = initDaySettings;
