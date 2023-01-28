'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const guestCheck = require('../middlewares/guestCheck');
const format = require('pg-format');

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

        // TODO: db一括挿入をutilsにする
        const tableName = 'fix_plans';
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

        const values = dayIds.reduce(
            (previous, id) => [
                ...previous,
                [id, title, context, startTime, endTime, processTime, travelTime, bufferTime, planType, priority, place]
            ],
            []
        );
        const sql = format(
            'INSERT INTO ' + tableName + ' (' + tableColumns.join(', ') + ') VALUES %L RETURNING *',
            values
        );

        const insertResult = await client.query(sql);
        const ids = insertResult.rows.map((row) => row.id);

        // setIdがリクエストにない時、上で作成した固定予定の先頭のidを利用する
        const setIdToInsert = setId ? setId : ids[0];
        const updateResult = await client.query(
            'UPDATE fix_plans SET set_id = $1 WHERE id = ANY($2::INTEGER[]) RETURNING *',
            [setIdToInsert, ids]
        );

        client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            fixPlans: updateResult.rows
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
 * 固定予定更新
 */
router.post('/update', async (req, res) => {
    const setId = req.body.setId;
    const title = req.body.title;
    const context = req.body.context;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const processTime = req.body.processTime;
    const travelTime = req.body.travelTime;
    const bufferTime = req.body.bufferTime;
    const priority = req.body.priority;
    const place = req.body.place;

    const client = await pool.connect();
    try {
        // TODO: バリデーションチェックを行う
        client.query('BEGIN');

        const result = await client.query(
            'UPDATE fix_plans SET title = $1, context = $2, start_time = $3, end_time = $4, process_time = $5, travel_time = $6, buffer_time = $7, priority = $8, place = $9 \
            WHERE set_id = $10 RETURNING *',
            [title, context, startTime, endTime, processTime, travelTime, bufferTime, priority, place, setId]
        );

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

/**
 * 固定予定削除
 */
router.delete('/delete', async (req, res) => {
    const ids = req.body.ids;

    const client = await pool.connect();
    try {
        // TODO: バリデーションチェックを行う
        client.query('BEGIN');
        const result = await client.query('SELECT * FROM fix_plans WHERE id = ANY($1::INTEGER[])', [ids]);
        if (result.rows.length !== ids.length) {
            throw new Error('There is some ids that is not existing in fix_plans. ids(' + ids.join(', ') + ')');
        } else if (result.rows.some((row) => result.rows[0].set_id !== row.set_id)) {
            throw new Error(
                'There is some records that has another set_id. ids(' +
                    ids.join(', ') +
                    '), set_ids(' +
                    result.rows.map((row) => row.set_id).join(', ') +
                    ')'
            );
        }

        await client.query('DELETE FROM fix_plans WHERE id = ANY($1::INTEGER[])', [ids]);
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
