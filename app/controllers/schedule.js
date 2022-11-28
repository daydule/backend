'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/**
 * スケジュールレコード更新
 */
router.post('/update', async (req, res) => {
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const date = req.body.date;
    const userId = req.user.id;

    try {
        // TODO バリデーションチェックを行う

        // TODO並び順の取得（履歴用ではなく、ユーザーに一つだけ紐づく並び順を取得）
        const result = await pool.query(
            'UPDATE schedules SET start_time = $1, end_time = $2 WHERE user_id = $3 AND date = $4 RETURNING *',
            [startTime, endTime, userId, date]
        );

        return res.status(200).json({
            isError: false,
            schedule: result.rows[0]
        });
    } catch (e) {
        console.error(e);

        // TODO バリデーションエラーはHTTPステータスコード400で返却する

        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    }
});

module.exports = router;
