'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const constant = require('../config/const');
const { transferSnakeCaseObjectToLowerCamelCaseObject } = require('../helpers/dbHelper');
const dbHelper = require('../helpers/dbHelper');
const scheduleHelper = require('../helpers/scheduleHelper');
const {
    readScheduleValidators,
    updateScheduleValidators
} = require('../middlewares/validator/scheduleControllerValidators');

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
            'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3 AND is_scheduled = $4',
            [userId, dateStr, constant.PLAN_TYPE.TODO, false]
        );

        const getTodoOrdersResult = await client.query(
            'SELECT * FROM todo_orders WHERE user_id = $1 AND schedule_id IS NULL',
            [userId]
        );

        const sortedTodos = [];
        if (getTodoResult.rows.length !== 0 && getTodoOrdersResult.rows.length !== 0) {
            const todoOrders = getTodoOrdersResult.rows[0].todo_orders.split(',');
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

                const getFixPlansResult = await dbHelper.query(client, 'SELECT * FROM fix_plans WHERE day_id = $1', [
                    getDaySettingsResult.rows[0].id
                ]);

                await getFixPlansResult.rows.forEach((plan) => {
                    dbHelper.query(
                        client,
                        'INSERT INTO plans (\
                                user_id, title, context, date, start_time, end_time, process_time, travel_time, buffer_time, plan_type, \
                                priority, place, is_required_plan) \
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
                        [
                            userId,
                            plan.title,
                            plan.context,
                            date,
                            plan.start_time,
                            plan.end_time,
                            plan.process_time,
                            plan.travel_time,
                            plan.buffer_time,
                            plan.plan_type,
                            plan.priority,
                            plan.place,
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

            const getTemporaryPlansResult = await dbHelper.query(
                client,
                'SELECT * FROM temporary_plans WHERE user_id = $1',
                [userId]
            );

            const getTemporaryPlans = (temporaryPlans, planId) => {
                for (let i = 0; i < temporaryPlans.length; i++) {
                    if (temporaryPlans[i].original_plan_id === planId) {
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
                        user_id: temporaryPlan.user_id,
                        title: temporaryPlan.title,
                        context: temporaryPlan.context,
                        date: temporaryPlan.date,
                        start_time: temporaryPlan.start_time,
                        end_time: temporaryPlan.end_time,
                        process_time: temporaryPlan.process_time,
                        travel_time: temporaryPlan.travel_time,
                        buffer_time: temporaryPlan.buffer_time,
                        plan_type: temporaryPlan.plan_type,
                        priority: temporaryPlan.priority,
                        place: temporaryPlan.place,
                        is_scheduled: plan.is_scheduled,
                        is_required_plan: plan.is_required_plan,
                        parent_plan_id: plan.parent_plan_id,
                        is_parent_plan: plan.is_parent_plan,
                        todo_start_time: temporaryPlan.todo_start_time
                    };
                }
                return plan;
            });

            await client.query('COMMIT');
            return res.status(200).json({
                isError: false,
                schedule: {
                    isScheduled: true,
                    plans: mixedPlans.map((plan) => transferSnakeCaseObjectToLowerCamelCaseObject(plan))
                },
                todos: getTodosResult.rows.map((plan) => transferSnakeCaseObjectToLowerCamelCaseObject(plan))
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
            return res.status(200).json({
                isError: false,
                schedule: {
                    isScheduled: false,
                    plans: getPlansResult.rows.map((plan) => transferSnakeCaseObjectToLowerCamelCaseObject(plan))
                },
                todos: getTodosResult.rows.map((plan) => transferSnakeCaseObjectToLowerCamelCaseObject(plan))
            });
        }
    } catch (e) {
        client.query('ROLLBACK');
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

        // TODO並び順の取得（履歴用ではなく、ユーザーに一つだけ紐づく並び順を取得）
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
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    } finally {
        client.release();
    }
});

module.exports = router;
