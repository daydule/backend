'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const guestCheck = require('../middlewares/guestCheck');

router.use(guestCheck);

/**
 * 固定予定作成
 */
router.post('/create', async (req, res) => {
    const dayIds = req.body.dayIds;
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
        const ids = [];
        for (let i = 0; i < dayIds.length; i++) {
            const sql =
                'INSERT INTO fix_plans (\
                day_id, title, context, start_time, end_time, process_time, \
                travel_time, buffer_time, plan_type, priority, place) \
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id';
            const values = [
                dayIds[i],
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
            ];
            const result = await client.query(sql, values);
            ids.push(result.rows[0].id);
        }

        // fix_plans.set_idに、上で作成した固定予定の先頭のidを利用する
        const result = await client.query(
            'UPDATE fix_plans SET set_id = $1 WHERE id = ANY($2::INTEGER[]) RETURNING *',
            [ids[0], ids]
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

module.exports = router;
