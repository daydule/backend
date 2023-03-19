'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const constant = require('../config/const');
const { transferSnakeCaseObjectToLowerCamelCaseObject } = require('../helpers/scheduleHelper');
const {
    readScheduleValidators,
    updateScheduleValidators
} = require('../middlewares/validator/scheduleControllerValidators');

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

    try {
        const getSchedulesResult = await pool.query('SELECT * FROM schedules WHERE user_id = $1 AND date = $2', [
            userId,
            date
        ]);

        if (getSchedulesResult.rows.length > 0) {
            isCreated = getSchedulesResult.rows[0].is_created;
            scheduleId = getSchedulesResult.rows[0].id;
        } else {
            let startTime = constant.DEFAULT.SCHEDULE.SCHEDULE_START_TIME;
            let endTime = constant.DEFAULT.SCHEDULE.SCHEDULE_END_TIME;

            if (!req.user.is_guest) {
                const getDaySettingsResult = await pool.query(
                    'SELECT * FROM day_settings WHERE user_id = $1 AND day = $2',
                    [userId, day]
                );

                if (getDaySettingsResult.rows.length === 0) {
                    throw new Error('There is no day setting info.');
                }

                startTime = getDaySettingsResult.rows[0].schedule_start_time;
                endTime = getDaySettingsResult.rows[0].schedule_end_time;

                const getFixPlansResult = await pool.query('SELECT * FROM fix_plans WHERE day_id = $1', [
                    getDaySettingsResult.rows[0].id
                ]);

                await getFixPlansResult.rows.forEach((plan) => {
                    pool.query(
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

            await pool.query('INSERT INTO schedules (user_id, date, start_time, end_time) VALUES ($1, $2, $3, $4)', [
                userId,
                date,
                startTime,
                endTime
            ]);
        }

        if (isCreated) {
            const getPlansResult = await pool.query(
                'SELECT * FROM schedule_plan_inclusion\
                JOIN plans ON schedule_plan_inclusion.plan_id = plans.id \
                WHERE schedule_id = $1',
                [scheduleId]
            );

            const getTodosResult = await pool.query(
                'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3 AND parent_plan_id IS NULL',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );

            const getTemporaryPlansResult = await pool.query('SELECT * FROM temporary_plans WHERE user_id = $1', [
                userId
            ]);

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

            return res.status(200).json({
                isError: false,
                schedule: {
                    isScheduled: true,
                    plans: mixedPlans.map((plan) => transferSnakeCaseObjectToLowerCamelCaseObject(plan))
                },
                todos: getTodosResult.rows.map((plan) => transferSnakeCaseObjectToLowerCamelCaseObject(plan))
            });
        } else {
            const getPlansResult = await pool.query(
                'SELECT * FROM plans WHERE user_id = $1 AND date = $2 AND plan_type != $3',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );
            const getTodosResult = await pool.query(
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
        console.error(e);

        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
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
