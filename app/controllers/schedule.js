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
    const client = await pool.connect();

    try {
        // NOTE: req.body.dateはYYYY-MM-DDの形
        const dateStr = req.body.date;
        const userId = req.user.id;

        // TODO: バリデーションチェック
        // TODO: 日付はYYYY-MM-DDの書式でチェックするように修正

        const getScheduleResult = await dbHelper.query(
            client,
            'SELECT * FROM schedules WHERE user_id = $1 AND date = $2',
            [userId, dateStr]
        );
        const scheduleId = getScheduleResult.rows[0].id;
        const startTime = getScheduleResult.rows[0].start_time;
        const endTime = getScheduleResult.rows[0].end_time;

        const getPlansResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND date = $2 AND plan_type != $3',
            [userId, dateStr, constant.PLAN_TYPE.TODO]
        );

        const getTodosResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3 AND is_scheduled = $4',
            [userId, dateStr, constant.PLAN_TYPE.TODO, false]
        );

        const getTodoListOrderResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);

        const todoListOrder = getTodoListOrderResult.rows[0].todoListOrder?.split(',')?.map((id) => Number(id));
        const todos = getTodosResult.rows;

        // NOTE: todoListOrderにないtodoがある場合は、後ろにそのtodoをつける
        const sortedTodos =
            todoListOrder == null
                ? todos
                : todoListOrder
                      .map((id) => todos.find((todo) => todo.id === id))
                      .filter((todo) => todo !== null)
                      .concat(todos.filter((todo) => !todoListOrder.includes(todo.id)));

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
            [startTime, endTime, true, scheduleId]
        );

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
    const dateStr = req.params.date;
    const userId = req.user.id;

    const date = new Date(dateStr);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await scheduleHelper.initSchedule(client, req.user.is_guest, userId, date);
        const getScheduleResult = await dbHelper.query(
            client,
            'SELECT * FROM schedules WHERE date = $1 and user_id = $2',
            [date, userId]
        );

        const getPlansResult = await dbHelper.query(client, 'SELECT * FROM plans WHERE user_id = $1 AND date = $2', [
            userId,
            dateStr
        ]);
        const getTodosResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND date IS NULL AND plan_type = $2',
            [userId, constant.PLAN_TYPE.TODO]
        );
        const getTodoListOrderResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);
        const todoListOrder = getTodoListOrderResult.rows[0].todoListOrder?.split(',')?.map((id) => Number(id));
        const todos = getTodosResult.rows;
        // NOTE: todoListOrderにないtodoがある場合は、後ろにそのtodoをつける
        const sortedTodos =
            todoListOrder == null
                ? todos
                : todoListOrder
                      .map((id) => todos.find((todo) => todo.id === id))
                      .filter((todo) => todo !== null)
                      .concat(todos.filter((todo) => !todoListOrder.includes(todo.id)));

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            schedule: {
                startTime: getScheduleResult.rows[0].startTime,
                endTime: getScheduleResult.rows[0].endTime,
                plans: getPlansResult.rows
            },
            todos: sortedTodos
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

        // TODO バリデーションチェックを行う

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
