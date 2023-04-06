'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const constant = require('../config/const');
const dbHelper = require('../helpers/dbHelper');
const scheduleHelper = require('../helpers/scheduleHelper');
const {
    readScheduleValidators,
    updateScheduleValidators
} = require('../middlewares/validator/scheduleControllerValidators');
const { PLAN_TYPE } = require('../config/const');

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

        const getTodoResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3 AND is_scheduled = $4',
            [userId, dateStr, constant.PLAN_TYPE.TODO, false]
        );

        const getTodoOrdersResult = await dbHelper.query(
            client,
            'SELECT * FROM todo_orders WHERE user_id = $1 AND schedule_id IS NULL',
            [userId]
        );

        const sortedTodos = [];
        if (getTodoResult.rows.length !== 0 && getTodoOrdersResult.rows.length !== 0) {
            const todoOrders = getTodoOrdersResult.rows[0].todoOrders.split(',');
            const todos = getTodoResult.rows;

            todoOrders.map((todoId) => {
                const targetTodo = todos.find((todo) => {
                    return todo.id === Number(todoId);
                });

                if (targetTodo) {
                    sortedTodos.push(targetTodo);
                }
            });
        }

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

        await dbHelper.query(client, 'INSERT INTO todo_orders(user_id, schedule_id, todo_orders) VALUES($1, $2, $3)', [
            userId,
            scheduleId,
            getTodoOrdersResult.rows[0].todoOrders
        ]);

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
    const day = date.getDay();
    let isCreated = false;
    let scheduleId = null;

    const client = await pool.connect();

    try {
        client.query('BEGIN');

        const getSchedulesResult = await dbHelper.query(
            client,
            'SELECT * FROM schedules WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        if (getSchedulesResult.rows.length > 0) {
            isCreated = getSchedulesResult.rows[0].isCreated;
            scheduleId = getSchedulesResult.rows[0].id;
        } else {
            let startTime = constant.DEFAULT.SCHEDULE.SCHEDULE_START_TIME;
            let endTime = constant.DEFAULT.SCHEDULE.SCHEDULE_END_TIME;

            if (!req.user.is_guest) {
                const getDaySettingsResult = await dbHelper.query(
                    client,
                    'SELECT * FROM day_settings WHERE user_id = $1 AND day = $2',
                    [userId, day]
                );

                if (getDaySettingsResult.rows.length === 0) {
                    throw new Error('There is no day setting info.');
                }

                startTime = getDaySettingsResult.rows[0].scheduleStartTime;
                endTime = getDaySettingsResult.rows[0].scheduleEndTime;

                const getRecurringPlansResult = await dbHelper.query(
                    client,
                    'SELECT * FROM recurring_plans WHERE day_id = $1',
                    [getDaySettingsResult.rows[0].id]
                );

                await getRecurringPlansResult.rows.forEach((recurringPlan) => {
                    dbHelper.query(
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
                            recurringPlan.start_time,
                            recurringPlan.end_time,
                            recurringPlan.travel_time,
                            recurringPlan.buffer_time,
                            PLAN_TYPE.PLAN,
                            recurringPlan.priority,
                            recurringPlan.place,
                            true
                        ]
                    );
                });
            }

            await dbHelper.query(
                client,
                'INSERT INTO schedules (user_id, date, start_time, end_time) VALUES ($1, $2, $3, $4)',
                [userId, date, startTime, endTime]
            );
        }

        if (isCreated) {
            const getPlansResult = await dbHelper.query(
                client,
                'SELECT * FROM schedule_plan_inclusion\
                JOIN plans ON schedule_plan_inclusion.plan_id = plans.id \
                WHERE schedule_id = $1',
                [scheduleId]
            );

            const getTodosResult = await dbHelper.query(
                client,
                'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3 AND parent_plan_id IS NULL',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );

            const getTodoOrdersResult = await dbHelper.query(client, 'SELECT * FROM todo_orders WHERE user_id = $1', [
                userId
            ]);

            const todoOrders = getTodoOrdersResult.rows[0].todoOrders.split(',');
            const todos = getTodosResult.rows;

            const sortedTodos =
                todoOrders.length === 0 || todos.length === 0
                    ? todos
                    : todoOrders.map((id) => todos.find((todo) => todo.id === Number(id)));

            const getTemporaryPlansResult = await dbHelper.query(
                client,
                'SELECT * FROM temporary_plans WHERE user_id = $1',
                [userId]
            );

            const getTemporaryPlans = (temporaryPlans, planId) => {
                for (let i = 0; i < temporaryPlans.length; i++) {
                    if (temporaryPlans[i].originalPlanId === planId) {
                        return temporaryPlans[i];
                    }
                }
                return null;
            };
            const mixedPlans = getPlansResult.rows.map((plan) => {
                const temporaryPlan = getTemporaryPlans(getTemporaryPlansResult.rows, plan.id);
                if (temporaryPlan) {
                    return {
                        id: plan.id,
                        userId: temporaryPlan.userId,
                        title: temporaryPlan.title,
                        context: temporaryPlan.context,
                        date: temporaryPlan.date,
                        startTime: temporaryPlan.startTime,
                        endTime: temporaryPlan.endTime,
                        processTime: temporaryPlan.processTime,
                        travelTime: temporaryPlan.travelTime,
                        bufferTime: temporaryPlan.bufferTime,
                        planType: temporaryPlan.planType,
                        priority: temporaryPlan.priority,
                        place: temporaryPlan.place,
                        isScheduled: plan.isScheduled,
                        isRequiredPlan: plan.isRequiredPlan,
                        parentPlanId: plan.parentPlanId,
                        isParentPlan: plan.isParentPlan
                    };
                }
                return plan;
            });

            await client.query('COMMIT');
            return res.status(200).json({
                isError: false,
                schedule: {
                    isScheduled: true,
                    plans: mixedPlans
                },
                todos: sortedTodos
            });
        } else {
            const getPlansResult = await dbHelper.query(
                client,
                'SELECT * FROM plans WHERE user_id = $1 AND date = $2 AND plan_type != $3',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );
            const getTodosResult = await dbHelper.query(
                client,
                'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );
            const getTodoOrdersResult = await dbHelper.query(client, 'SELECT * FROM todo_orders WHERE user_id = $1', [
                userId
            ]);

            const todoOrders = getTodoOrdersResult.rows[0].todoOrders.split(',');
            const todos = getTodosResult.rows;

            const sortedTodos =
                todoOrders.length === 0 || todos.length === 0
                    ? todos
                    : todoOrders.map((id) => todos.find((todo) => todo.id === Number(id)));

            return res.status(200).json({
                isError: false,
                schedule: {
                    isScheduled: false,
                    plans: getPlansResult.rows
                },
                todos: sortedTodos
            });
        }
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
