'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const {
    createPlanValidators,
    upsertTodoPriorityValidators,
    updatePlanValidators,
    deletePlanValidators
} = require('../middlewares/validator/planControllerValidators');
const dbHelper = require('../helpers/dbHelper');

/**
 * 予定作成
 */
router.post('/create', createPlanValidators, async (req, res) => {
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

    const client = await pool.connect();

    try {
        client.query('BEGIN');

        const sql =
            'INSERT INTO plans (\
            user_id, title, context, date, start_time, end_time, process_time, travel_time, buffer_time, plan_type, \
            priority, place, is_required_plan) \
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *';
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
            isRequiredPlan
        ];
        const result = await dbHelper.query(client, sql, values);
        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            plan: result.rows[0]
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

/**
 * 予定更新
 */
router.post('/:id/update', updatePlanValidators, async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

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

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const getPlanResult = await dbHelper.query(client, 'SELECT * from plans where id = $1', [id]);
        if (getPlanResult.rows.length === 0) {
            throw new Error('There is no plan with id(' + id + ').');
        }

        const sql =
            'UPDATE plans \
                SET user_id = $1, title = $2, context = $3, date = $4, start_time = $5, end_time = $6, \
                process_time = $7, travel_time = $8, buffer_time = $9, plan_type = $10, \
                priority = $11, place = $12, is_required_plan = $13, parent_plan_id = $14, \
                is_parent_plan = $15 \
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
            id
        ];
        const result = await dbHelper.query(client, sql, values);
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
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * 予定削除
 */
router.post('/:id/delete', deletePlanValidators, async (req, res) => {
    const id = req.params.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const getPlanResult = await dbHelper.query(client, 'SELECT * from plans where id = $1', [id]);
        if (getPlanResult.rows.length === 0) {
            throw new Error('There is no plan with id(' + id + ').');
        }

        await dbHelper.query(client, 'DELETE from plans where id = $1', [id]);
        await client.query('COMMIT');
        return res.status(200).json({
            isError: false
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
 * TODOの優先度順の作成/更新処理
 */
router.post('/upsertTodoPriority', upsertTodoPriorityValidators, async (req, res) => {
    const ids = req.body.ids;
    const client = await pool.connect();
    const idsCsv = ids.join(',');

    try {
        const getTodoOrderResult = await dbHelper.query(
            client,
            'SELECT * FROM todo_orders WHERE user_id = $1 AND schedule_id IS NULL',
            [req.user.id]
        );

        const hasRecord = getTodoOrderResult.rows.length > 0;
        const sql = hasRecord
            ? 'UPDATE todo_orders SET todo_orders = $1 WHERE id = $2 RETURNING *'
            : 'INSERT INTO todo_orders (user_id, todo_orders) VALUES ($1, $2) RETURNING *';
        const values = hasRecord ? [idsCsv, getTodoOrderResult.rows[0].id] : [req.user.id, idsCsv];

        const upsertResult = await dbHelper.query(client, sql, values);

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            todoOrders: upsertResult.rows[0]
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

module.exports = router;
