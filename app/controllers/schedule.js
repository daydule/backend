'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const constant = require('../config/const');
const dbHelper = require('../helpers/dbHelper');
const scheduleHelper = require('../helpers/scheduleHelper');
const {
    readScheduleValidators,
    updateScheduleValidators,
    createScheduleValidators
} = require('../middlewares/validator/scheduleControllerValidators');

/**
 * スケジュール作成
 */
router.post('/create', createScheduleValidators, async (req, res) => {
    const timeUtils = require('../utils/time');
    const dateStr = req.body.date;
    const userId = req.user.id;
    let currentTime = req.body.currentTime; // NOTE: HHmmの書式

    const ceilCurrentTimeUpToDivisibleByFive = (currentTime) => {
        const now = new Date();
        now.setHours(Number(currentTime.substr(0, 2)));
        now.setMinutes(Number(currentTime.substr(2, 2)));

        const minutes = now.getMinutes();
        const roundedMinutes = Math.ceil(minutes / 5) * 5;
        if (roundedMinutes === 60) {
            now.setHours(now.getHours() + 1);
            now.setMinutes(0);
        } else {
            now.setMinutes(roundedMinutes);
        }
        return now;
    };

    const ceilCurrentTimeResult = ceilCurrentTimeUpToDivisibleByFive(currentTime);
    currentTime =
        ('00' + ceilCurrentTimeResult.getHours()).slice(-2) + ('00' + ceilCurrentTimeResult.getMinutes()).slice(-2);

    const client = await pool.connect();
    try {
        const getScheduleResult = await dbHelper.query(
            client,
            'SELECT * FROM schedules WHERE user_id = $1 AND date = $2',
            [userId, dateStr]
        );
        const scheduleId = getScheduleResult.rows[0].id;
        // NOTE: 開始時刻より現在時刻が遅い場合は現在時刻を利用する
        const startTime =
            timeUtils.compareTimeStr(currentTime, getScheduleResult.rows[0].startTime) > 0
                ? currentTime
                : getScheduleResult.rows[0].startTime;

        // NOTE: 終了時刻より現在時刻の方が遅い場合にはエラー
        const endTime = getScheduleResult.rows[0].endTime;
        if (timeUtils.compareTimeStr(currentTime, endTime) > 0) {
            throw new Error('The end time has already passed.');
        }

        const getPlansResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND date = $2 AND plan_type = $3',
            [userId, dateStr, constant.PLAN_TYPE.PLAN]
        );

        const getTodosResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND date IS NULL AND plan_type = $2',
            [userId, constant.PLAN_TYPE.TODO]
        );

        const getTodoListOrderResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);

        const todoListOrder = getTodoListOrderResult.rows[0].todoListOrder
            ?.split(',')
            ?.filter((id) => id)
            .map((id) => Number(id));
        const todos = getTodosResult.rows;
        const sortedTodos =
            todoListOrder == null
                ? todos
                : todoListOrder.map((id) => todos.find((todo) => todo.id === id)).filter((todo) => todo !== null);

        await client.query('BEGIN');

        const createScheduleResult = await scheduleHelper.createSchedule(
            client,
            0,
            userId,
            scheduleId,
            startTime,
            endTime,
            getPlansResult.rows,
            sortedTodos,
            dateStr
        );

        if (createScheduleResult.isError) {
            throw new Error('Fail to create schedule.' + createScheduleResult.errorMessage);
        }

        await dbHelper.query(
            client,
            'UPDATE schedules SET start_time = $1, end_time = $2, is_created = $3 WHERE id = $4',
            [getScheduleResult.rows[0].startTime, endTime, true, scheduleId]
        );

        const scheduledTodoIds = createScheduleResult.result.schedule.todos.map((todo) => todo.id);
        const listTodoIds = createScheduleResult.result.other.todos.map((todo) => todo.id);

        const scheduledTodoIdsCsv = scheduledTodoIds.length > 0 ? scheduledTodoIds.join(',') : null;
        const listTodoIdsCsv = listTodoIds.length > 0 ? listTodoIds.join(',') : null;

        await dbHelper.query(client, 'UPDATE users SET scheduled_todo_order = $1 WHERE id = $2', [
            scheduledTodoIdsCsv,
            userId
        ]);
        await dbHelper.query(client, 'UPDATE users SET todo_list_order = $1 WHERE id = $2', [listTodoIdsCsv, userId]);

        await client.query('COMMIT');

        return res.status(200).json(createScheduleResult);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * スケジュール参照
 */
router.get('/read/:date', readScheduleValidators, async (req, res) => {
    const userId = req.user.id;
    const date = new Date(req.params.date);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await scheduleHelper.initSchedule(client, req.user.is_guest, userId, date);
        const getScheduleResult = await dbHelper.query(
            client,
            'SELECT * FROM schedules WHERE user_id = $1 and date = $2',
            [userId, date]
        );

        const getScheduledPlansResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND date = $2',
            [userId, date]
        );
        const getTodosResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND date IS NULL AND plan_type = $2',
            [userId, constant.PLAN_TYPE.TODO]
        );
        const getTodoListOrderResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);
        const todoListOrder = getTodoListOrderResult.rows[0].todoListOrder
            ?.split(',')
            ?.filter((id) => id)
            .map((id) => Number(id));
        const todos = getTodosResult.rows;
        const sortedListTodos =
            todoListOrder == null
                ? todos
                : todoListOrder.map((id) => todos.find((todo) => todo.id === id)).filter((todo) => todo !== null);

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            schedule: {
                startTime: getScheduleResult.rows[0].startTime,
                endTime: getScheduleResult.rows[0].endTime,
                plans: getScheduledPlansResult.rows
            },
            todos: sortedListTodos
        });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * スケジュールレコード更新
 */
router.post('/:date/update', updateScheduleValidators, async (req, res) => {
    const date = req.params.date;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const userId = req.user.id;

    const client = await pool.connect();

    try {
        client.query('BEGIN');

        const result = await dbHelper.query(
            client,
            'UPDATE schedules SET start_time = $1, end_time = $2 WHERE user_id = $3 AND date = $4 RETURNING *',
            [startTime, endTime, userId, date]
        );

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            schedule: result.rows[0]
        });
    } catch (e) {
        client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

module.exports = router;
