'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/**
 * 予定作成
 */
router.post('/create', async (req, res) => {
    const userId = req.user.id;
    const title = req.body.title;
    const context = req.body.context;
    const date = req.body.date;
    const startTime = req.body.start_time;
    const endTime = req.body.end_time;
    const processTime = req.body.process_time;
    const travelTime = req.body.travel_time;
    const bufferTime = req.body.buffer_time;
    const planType = req.body.plan_type;
    const priority = req.body.priority;
    const place = req.body.place;
    const isRequiredPlan = req.body.is_required_plan;
    const todoStartTime = req.body.todo_start_time;

    try {
        // TODO バリデーションチェックを行う

        const result = await pool.query(
            'INSERT INTO plans (\
                user_id, title, context, date, start_time, end_time, process_time, travel_time, buffer_time, plan_type, \
                priority, place, is_required_plan, todo_start_time) \
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
            [
                userId,
                title,
                context,
                date,
                startTime,
                endTime,
                processTime,
                travelTime,
                bufferTime,
                planType,
                priority,
                place,
                isRequiredPlan,
                todoStartTime
            ]
        );

        return res.status(200).json({
            isError: false,
            plan: result.rows[0]
        });
    } catch (e) {
        // TODO バリデーションエラーはHTTPステータスコード400で返却するように実装する
        console.error(e);

        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    }
});

module.exports = router;
