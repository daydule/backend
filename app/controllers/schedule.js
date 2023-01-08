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

    try {
        // NOTE: req.body.dateはYYYY-MM-DDの形
        const dateStr = req.body.date;
        const userId = req.user.id;

        // TODO: バリデーションチェック

        const getScheduleResult = await client.query('SELECT * FROM schedules WHERE user_id = $1 AND date = $2', [
            userId,
            dateStr
        ]);
        const scheduleId = getScheduleResult.rows[0].id;
        const startTime = getScheduleResult.rows[0].start_time;
        const endTime = getScheduleResult.rows[0].end_time;

        const getPlansResult = await client.query(
            'SELECT * FROM plans WHERE user_id = $1 AND date = $2 AND plan_type != $3',
            [userId, dateStr, constant.PLAN_TYPE.TODO]
        );

        const getTodoResult = await client.query(
            'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3 AND is_done = $4',
            [userId, dateStr, constant.PLAN_TYPE.TODO, false]
        );

        const getTodoOrdersResult = await client.query(
            'SELECT * FROM todo_orders WHERE user_id = $1 AND schedule_id IS NULL',
            [userId]
        );

        await client.query('BEGIN');

        await client.query('DELETE FROM temporary_plans WHERE user_id = $1', [userId]);

        const createScheduleResult = await scheduleHelper.createSchedule(
            client,
            0,
            userId,
            scheduleId,
            startTime,
            endTime,
            getPlansResult.rows,
            getTodoResult.rows
        );

        if (createScheduleResult.isError) {
            throw new Error('Fail to create schedule.');
        }

        await client.query('INSERT INTO todo_orders(user_id, schedule_id, todo_orders) VALUES($1, $2, $3)', [
            userId,
            scheduleId,
            getTodoOrdersResult.rows[0].todo_orders
        ]);

        await client.query(
            'UPDATE schedules SET start_time_at_schedule = $1, end_time_at_schedule = $2, is_created = $3 WHERE id = $4',
            [startTime, endTime, true, scheduleId]
        );

        await client.query('COMMIT');

        return res.status(200).json(createScheduleResult);
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
