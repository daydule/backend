'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const constant = require('../config/const');
const scheduleHelper = require('../helpers/scheduleHelper');

/**
 * スケジュール作成
 */
router.post('/create', async (req, res) => {
    const client = await pool.connect();

    // NOTE: req.body.dateはYYYY-MM-DDの形
    const dateStr = req.body.date;
    const userId = req.user.id;

    // TODO: バリデーションチェック

    // TODO: スケジュールレコードを取得する
    const scheduleId = 1;
    const startTime = '0900';
    const endTime = '1800';

    // TODO: 日程が同じ予定を取得する
    const plans = [];

    // TODO: 未完了TODOを取得する
    const todos = [];

    try {
        // TODO: 過去の仮予定を削除する
        // TODO: TODO並び順を複製する
        // TODO: スケジュール作成

        let result = scheduleHelper.createSchedule(pool, 0, userId, scheduleId, startTime, endTime, plans, todos);
        // TODO: 結果を返却
        return res.status(200).json({
            isError: false,
            schedule: result
        });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    } finally {
        client.release();
    }
});

module.exports = router;
