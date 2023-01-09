'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { validationResult } = require('express-validator/check');
const { plansValidationCheck, todoOrdersValidationCheck, errorMessageFormatter } = require('../middlewares/validator');

/**
 * 予定作成
 */
router.post(
    '/create',
    [
        plansValidationCheck.title,
        plansValidationCheck.context,
        plansValidationCheck.date,
        plansValidationCheck.startTime,
        plansValidationCheck.endTime,
        plansValidationCheck.processTime,
        plansValidationCheck.travelTime,
        plansValidationCheck.bufferTime,
        plansValidationCheck.planType,
        plansValidationCheck.priority,
        plansValidationCheck.place,
        plansValidationCheck.isRequiredPlan,
        plansValidationCheck.todoStartTime
    ],
    async (req, res) => {
        const result = validationResult(req);
        if (result.errors.length !== 0) {
            console.error(result);
            return res.status(400).json({
                isError: true,
                errorId: 'errorId',
                errorMessage: errorMessageFormatter(result.errors)
            });
        }

        const userId = req.user.id;
        const title = req.body.title;
        const context = req.body.context;
        const date = req.body.date;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const processTime = req.body.processTime;
        const travelTime = req.body.travelTime;
        const bufferTime = req.body.bufferTime;
        const planType = req.body.planType;
        const priority = req.body.priority;
        const place = req.body.place;
        const isRequiredPlan = req.body.isRequiredPlan;
        const todoStartTime = req.body.todoStartTime;

        try {
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
            console.error(e);
            return res.status(500).json({
                isError: true,
                errorId: 'errorId',
                errorMessage: 'システムエラー'
            });
        }
    }
);

/**
 * 予定作成（スケジュール作成後）
 */
router.post('/temporary/create', async (req, res) => {
    const userId = req.user.id;
    const title = req.body.title;
    const context = req.body.context;
    const date = req.body.date;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const processTime = req.body.processTime;
    const travelTime = req.body.travelTime;
    const bufferTime = req.body.bufferTime;
    const planType = req.body.planType;
    const priority = req.body.priority;
    const place = req.body.place;
    const todoStartTime = req.body.todoStartTime;

    try {
        // TODO バリデーションチェックを行う

        const result = await pool.query(
            'INSERT INTO temporary_plans (\
                user_id, title, context, date, start_time, end_time, process_time, \
                travel_time, buffer_time, plan_type, priority, place, todo_start_time) \
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
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
                todoStartTime
            ]
        );

        return res.status(200).json({
            isError: false,
            temporaryPlan: result.rows[0]
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

/**
 * TODO並び順の作成/更新処理
 */
router.post('/upsertTodoPriority', [todoOrdersValidationCheck.todoOrders], async (req, res) => {
    const result = validationResult(req);
    if (result.errors.length !== 0) {
        console.error(result);
        return res.status(400).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: errorMessageFormatter(result.errors)
        });
    }

    const todoOrders = req.body.todoOrders; // TODOのIDをカンマ区切りにした文字列
    let upsertResult;

    try {
        // TODO並び順の取得（履歴用ではなく、ユーザーに一つだけ紐づく並び順を取得）
        const getResult = await pool.query('SELECT * FROM todo_orders WHERE user_id = $1 AND schedule_id IS NULL', [
            req.user.id
        ]);

        if (getResult.rows.length > 0) {
            upsertResult = await pool.query('UPDATE todo_orders SET todo_orders = $1 WHERE id = $2 RETURNING *', [
                todoOrders,
                getResult.rows[0].id
            ]);
        } else {
            upsertResult = await pool.query(
                'INSERT INTO todo_orders (user_id, todo_orders) VALUES ($1, $2) RETURNING *',
                [req.user.id, todoOrders]
            );
        }

        return res.status(200).json({
            isError: false,
            todoOrders: upsertResult.rows[0]
        });
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
