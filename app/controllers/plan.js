'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const {
    createPlanValidators,
    updateTodoPriorityValidators,
    updatePlanValidators,
    deletePlanValidators
} = require('../middlewares/validator/planControllerValidators');
const dbHelper = require('../helpers/dbHelper');
const { PLAN_TYPE } = require('../config/const');

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
        const insertResult = await dbHelper.query(client, sql, values);

        if (planType === PLAN_TYPE.TODO) {
            const getUserResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);
            const newTodoId = insertResult.rows[0].id;
            const currentOrder = getUserResult.rows[0].todoListOrder?.split(',');
            const newOrderCsv = currentOrder ? [newTodoId].concat(currentOrder).join(',') : newTodoId;
            await dbHelper.query(client, 'UPDATE users SET todo_list_order = $1 WHERE id = $2', [newOrderCsv, userId]);
        }

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            plan: insertResult.rows[0]
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
    const userId = req.user.id;
    const id = req.params.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const getPlanResult = await dbHelper.query(client, 'SELECT * from plans where id = $1', [id]);
        if (getPlanResult.rows.length === 0) {
            throw new Error('There is no plan with id(' + id + ').');
        }

        const deleteResult = await dbHelper.query(client, 'DELETE from plans WHERE id = $1 RETURNING *', [id]);

        if (deleteResult.rows[0].planType === PLAN_TYPE.TODO) {
            const getUserResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);
            const newOrder = getUserResult.rows[0].todoListOrder
                ?.split(',')
                .filter((id) => Number(id) !== deleteResult.rows[0].id)
                .join(',');
            await dbHelper.query(client, 'UPDATE users SET todo_list_order = $1 WHERE id = $2', [
                newOrder === '' ? null : newOrder,
                userId
            ]);
        }

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
router.post('/updateTodoPriority', updateTodoPriorityValidators, async (req, res) => {
    const userId = req.user.id;
    const ids = req.body.ids;
    const client = await pool.connect();
    const idsCsv = ids.join(',');

    try {
        await client.query('BEGIN');

        const updateResult = await dbHelper.query(
            client,
            'UPDATE users SET todo_list_order = $1 WHERE id = $2 RETURNING *',
            [idsCsv, userId]
        );

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            todoListOrder: updateResult.rows[0]
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
 * スケジュール表のTODOをリストに戻す
 */
router.post('/:id/backToList', async (req, res) => {
    const planHelper = require('../helpers/planHelper');

    const userId = req.user.id;
    const id = req.params.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await planHelper.backToList(client, userId, id);

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
 * スケジュール表のTODOを全てリストに戻す
 */
router.post('/backToList', async (req, res) => {
    const planHelper = require('../helpers/planHelper');
    const constant = require('../config/const');

    const userId = req.user.id;
    const dateStr = req.body.date;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const getPlansResult = await dbHelper.query(
            client,
            'SELECT * FROM plans WHERE user_id = $1 AND date = $2 AND plan_type = $3',
            [userId, dateStr, constant.PLAN_TYPE.TODO]
        );

        for (let i = 0; i < getPlansResult.rows.length; i++) {
            await planHelper.backToList(client, userId, getPlansResult.rows[i].id);
        }

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

module.exports = router;
