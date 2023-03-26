'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const guestCheck = require('../middlewares/guestCheck');
const { bulkInsert } = require('../utils/dbOperation');
const dbHelper = require('../helpers/dbHelper');
const {
    createRecurringPlanValidators,
    updateRecurringPlanValidators,
    deleteRecurringPlanValidators
} = require('../middlewares/validator/recurringPlanControllerValidators');

router.use(guestCheck);

/**
 * 繰り返し予定作成
 */
router.post('/create', createRecurringPlanValidators, async (req, res) => {
    const dayIds = req.body.dayIds;
    const setId = req.body.setId;
    const title = req.body.title;
    const context = req.body.context;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const travelTime = req.body.travelTime;
    const bufferTime = req.body.bufferTime;
    const priority = req.body.priority;
    const place = req.body.place;

    const client = await pool.connect();

    try {
        // TODO: バリデーションチェックを行う
        client.query('BEGIN');

        const tableName = 'recurring_plans';
        let result;

        if (setId) {
            const tableColumns = [
                'day_id',
                'set_id',
                'title',
                'context',
                'start_time',
                'end_time',
                'travel_time',
                'buffer_time',
                'priority',
                'place'
            ];
            const values = dayIds.map((dayId) => [
                dayId,
                setId,
                title,
                context,
                startTime,
                endTime,
                travelTime,
                bufferTime,
                priority,
                place
            ]);
            result = await bulkInsert(client, tableName, tableColumns, values);
        } else {
            const tableColumns = [
                'day_id',
                'title',
                'context',
                'start_time',
                'end_time',
                'travel_time',
                'buffer_time',
                'priority',
                'place'
            ];
            const values = dayIds.map((dayId) => [
                dayId,
                title,
                context,
                startTime,
                endTime,
                travelTime,
                bufferTime,
                priority,
                place
            ]);
            const insertResult = await bulkInsert(client, tableName, tableColumns, values);

            const ids = insertResult.rows.map((row) => row.id);

            // INSERTした繰り返し予定の先頭のidをset_idとして利用する
            result = await dbHelper.query(
                client,
                'UPDATE recurring_plans SET set_id = $1 WHERE id = ANY($2::INTEGER[]) RETURNING *',
                [ids[0], ids]
            );
        }

        client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            recurringPlans: result.rows
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

/**
 * 繰り返し予定更新
 */
router.post('/update', updateRecurringPlanValidators, async (req, res) => {
    const setId = req.body.setId;
    const title = req.body.title;
    const context = req.body.context;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const travelTime = req.body.travelTime;
    const bufferTime = req.body.bufferTime;
    const priority = req.body.priority;
    const place = req.body.place;

    const client = await pool.connect();
    try {
        // TODO: バリデーションチェックを行う
        client.query('BEGIN');

        const result = await dbHelper.query(
            client,
            'UPDATE recurring_plans SET title = $1, context = $2, start_time = $3, end_time = $4, travel_time = $5, buffer_time = $6, priority = $7, place = $8 \
            WHERE set_id = $9 RETURNING *',
            [title, context, startTime, endTime, travelTime, bufferTime, priority, place, setId]
        );

        client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            recurringPlans: result.rows
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

/**
 * 繰り返し予定削除
 */

router.post('/delete', deleteRecurringPlanValidators, async (req, res) => {
    const ids = req.body.ids;

    const client = await pool.connect();
    try {
        // TODO: バリデーションチェックを行う
        client.query('BEGIN');
        const result = await dbHelper.query(client, 'SELECT * FROM recurring_plans WHERE id = ANY($1::INTEGER[])', [
            ids
        ]);
        if (result.rows.length !== ids.length) {
            throw new Error('There is some ids that is not existing in recurring_plans. ids(' + ids.join(', ') + ')');
        } else if (result.rows.some((row) => result.rows[0].setId !== row.setId)) {
            throw new Error(
                'There is some records that has another set_id. ids(' +
                    ids.join(', ') +
                    '), set_ids(' +
                    result.rows.map((row) => row.setId).join(', ') +
                    ')'
            );
        }

        await dbHelper.query(client, 'DELETE FROM recurring_plans WHERE id = ANY($1::INTEGER[])', [ids]);
        client.query('COMMIT');
        return res.status(200).json({
            isError: false
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
