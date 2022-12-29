'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const constant = require('../config/const');

/**
 * スケジュール参照
 */
router.get('/read', async (req, res) => {
    // NOTE req.body.dateはYYYY-MM-DDの形
    const dateStr = req.body.date;
    const userId = req.user.id;

    const date = new Date(dateStr);
    const day = date.getDay();
    let isScheduled = false;
    let scheduleId = null;

    try {
        const getScheduleResult = await pool.query('SELECT * FROM schedules WHERE user_id = $1 AND date = $2', [
            userId,
            dateStr
        ]);

        if (getScheduleResult.rows.length > 0) {
            isScheduled = getScheduleResult.rows[0].is_scheduled;
            scheduleId = getScheduleResult.rows[0].id;
        } else {
            let startTime = constant.DEFAULT.SCHEDULE.SCHEDULE_START_TIME;
            let endTime = constant.DEFAULT.SCHEDULE.SCHEDULE_END_TIME;

            if (!req.user.is_guest) {
                const getDaySettingResult = await pool.query(
                    'SELECT * FROM day_settings WHERE user_id = $1 AND day = $2',
                    [userId, day]
                );

                if (getDaySettingResult.rows.length) {
                    startTime = getDaySettingResult.rows[0].schedule_start_time;
                    endTime = getDaySettingResult.rows[0].schedule_end_time;

                    const getFixPlansResult = await pool.query('SELECT * FROM fix_plans WHERE day_id = $1', [
                        getDaySettingResult.rows[0].id
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
                } else {
                    throw new Error('曜日設定情報がありません。');
                }
            }

            await pool.query('INSERT INTO schedules (user_id, date, start_time, end_time) VALUES ($1, $2, $3, $4)', [
                userId,
                date,
                startTime,
                endTime
            ]);
        }

        if (isScheduled) {
            const getPlansResult = await pool.query(
                'SELECT * FROM schedule_plan_inclusion\
                JOIN plans ON schedule_plan_inclusion.plan_id = plans.id \
                WHERE schedule_id = $1',
                [scheduleId]
            );

            const getTodoResult = await pool.query(
                'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );

            const getTemporaryPlansResult = await pool.query('SELECT * FROM temporary_plans WHERE user_id = $1', [
                userId
            ]);

            const getTemporaryPlan = (temporaryPlans, planId) => {
                for (let i = 0; i < temporaryPlans.length; i++) {
                    if (temporaryPlans[i].original_plan_id === planId) {
                        return temporaryPlans[i];
                    }
                }
                return null;
            };
            const mixedPlans = getPlansResult.rows.map((plan) => {
                const temporaryPlan = getTemporaryPlan(getTemporaryPlansResult.rows, plan.id);
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
                    plans: mixedPlans
                },
                todos: getTodoResult.rows
            });
        } else {
            const getPlansResult = await pool.query(
                'SELECT * FROM plans WHERE user_id = $1 AND date = $2 AND plan_type != $3',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );
            const getTodoResult = await pool.query(
                'SELECT * FROM plans WHERE user_id = $1 AND (date IS NULL OR date = $2) AND plan_type = $3',
                [userId, dateStr, constant.PLAN_TYPE.TODO]
            );
            return res.status(200).json({
                isError: false,
                schedule: {
                    isScheduled: false,
                    plans: getPlansResult.rows
                },
                todos: getTodoResult.rows
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

module.exports = router;
