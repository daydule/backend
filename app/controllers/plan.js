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
        // TODO: バリデーションチェックを行う

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
        // TODO: バリデーションエラーはHTTPステータスコード400で返却するように実装する

        console.error(e);

        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    }
});

/**
 * 予定更新
 */
router.post('/:id/update', async (req, res) => {
    // TODO: バリデーションチェックを行う
    const id = req.params.id;

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
    const parentPlanId = req.body.parentPlanId;
    const isParentPlan = req.body.isParentPlan;
    const todoStartTime = req.body.todoStartTime;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const getPlanResult = await client.query('SELECT * from plans where id = $1', [id]);
        if (getPlanResult.rows.length === 0) {
            throw new Error('There is no plan with id(' + id + ').');
        }
        const sql =
            'UPDATE plans \
                SET user_id = $1, title = $2, context = $3, date = $4, start_time = $5, end_time = $6, \
                process_time = $7, travel_time = $8, buffer_time = $9, plan_type = $10, \
                priority = $11, place = $12, is_required_plan = $13, parent_plan_id = $14, \
                is_parent_plan = $15, todo_start_time = $16 \
                WHERE id = $17 RETURNING *';
        const values = [
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
            parentPlanId,
            isParentPlan,
            todoStartTime,
            id
        ];
        const result = await client.query(sql, values);
        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            plan: result.rows[0]
        });
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
        // TODO: バリデーションチェックを行う

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
        // TODO: バリデーションエラーはHTTPステータスコード400で返却するように実装する

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
router.post('/upsertTodoPriority', async (req, res) => {
    const todoOrders = req.body.todoOrders; // TODOのIDをカンマ区切りにした文字列
    let upsertResult;

    try {
        // TODO: バリデーションチェックを行う

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

        // TODO: バリデーションエラーはHTTPステータスコード400で返却する

        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    }
});

module.exports = router;
