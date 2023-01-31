'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const guestCheck = require('../middlewares/guestCheck');
const { bulkInsert } = require('../utils/dbOperation');

router.use(guestCheck);

/**
 * 固定予定作成
 */
router.post('/create', async (req, res) => {
    const dayIds = req.body.dayIds;
    const setId = req.body.setId;
    const title = req.body.title;
    const context = req.body.context;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const processTime = req.body.processTime;
    const travelTime = req.body.travelTime;
    const bufferTime = req.body.bufferTime;
    const planType = req.body.planType;
    const priority = req.body.priority;
    const place = req.body.place;

    const client = await pool.connect();

    try {
        // TODO: バリデーションチェックを行う
        client.query('BEGIN');

        const tableName = 'fix_plans';
        let result;

        if (setId) {
            const tableColumns = [
                'day_id',
                'set_id',
                'title',
                'context',
                'start_time',
                'end_time',
                'process_time',
                'travel_time',
                'buffer_time',
                'plan_type',
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
                processTime,
                travelTime,
                bufferTime,
                planType,
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
                'process_time',
                'travel_time',
                'buffer_time',
                'plan_type',
                'priority',
                'place'
            ];
            const values = dayIds.map((dayId) => [
                dayId,
                title,
                context,
                startTime,
                endTime,
                processTime,
                travelTime,
                bufferTime,
                planType,
                priority,
                place
            ]);
            const insertResult = await bulkInsert(client, tableName, tableColumns, values);

            const ids = insertResult.rows.map((row) => row.id);

            // INSERTした固定予定の先頭のidをset_idとして利用する
            result = await client.query('UPDATE fix_plans SET set_id = $1 WHERE id = ANY($2::INTEGER[]) RETURNING *', [
                ids[0],
                ids
            ]);
        }

        client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            fixPlans: result.rows
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
