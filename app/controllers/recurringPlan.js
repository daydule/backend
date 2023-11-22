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
    const userId = req.user.id;
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
        client.query('BEGIN');
        const daySettings = [];
        const daySettingsResult = await dbHelper.query(
            client,
            'SELECT id FROM day_settings WHERE user_id = $1 AND day = ANY($2::INTEGER[]) ORDER BY id',
            [userId, dayIds]
        );
        daySettings.push(...daySettingsResult.rows);

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
            const values = daySettings.map((daySetting) => [
                daySetting.id,
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
            const values = daySettings.map((daySetting) => [
                daySetting.id,
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
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * 繰り返し予定更新
 */
router.post('/update', updateRecurringPlanValidators, async (req, res) => {
    const userId = req.user.id;
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
        client.query('BEGIN');
        const daySettings = [];
        const daySettingsResult = await dbHelper.query(client, 'SELECT id FROM day_settings WHERE user_id = $1', [
            userId
        ]);
        daySettings.push(...daySettingsResult.rows);
        const dayIds = daySettings.map((daySetting) => daySetting.id);

        const result = await dbHelper.query(
            client,
            'UPDATE recurring_plans SET title = $1, context = $2, start_time = $3, end_time = $4, travel_time = $5, buffer_time = $6, priority = $7, place = $8 \
            WHERE set_id = $9 AND day_id = ANY($10::INTEGER[]) RETURNING *',
            [title, context, startTime, endTime, travelTime, bufferTime, priority, place, setId, dayIds]
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
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * 繰り返し予定削除
 */

router.post('/delete', deleteRecurringPlanValidators, async (req, res) => {
    const userId = req.user.id;
    const ids = req.body.ids;

    const client = await pool.connect();
    try {
        client.query('BEGIN');
        const result = await dbHelper.query(
            client,
            'SELECT rp.* FROM recurring_plans rp INNER JOIN day_settings ds ON rp.day_id = ds.id WHERE ds.user_id = $1 AND rp.id = ANY($2::INTEGER[])',
            [userId, ids]
        );
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
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * 繰り返し予定参照
 */
router.get('/read', async function (req, res) {
    const formatUtils = require('../utils/formatApiResponse');
    const userId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const recurringPlansAndDaySettingsResult = await dbHelper.query(
            client,
            'SELECT rp.*, rp.id as recurring_plans_id, ds.id as day_settings_id, ds.day, ds.schedule_start_time, ds.schedule_end_time, ds.scheduling_logic FROM recurring_plans rp RIGHT OUTER JOIN day_settings ds ON rp.day_id = ds.id WHERE ds.user_id = $1;',
            [userId]
        );
        const result = recurringPlansAndDaySettingsResult.rows;
        const recurringPlansResult = formatUtils.sliceObjectStEd(result, 0, -6).filter((obj) => obj.id != null);
        const daySettingsResult = formatUtils.sliceObjectSt(result, -6);

        //曜日毎の繰り返し予定テーブルのidを配列で保持するオブジェクトを作成
        const recurringPlansIdsForEachDayId = Array.from({ length: 7 }, () => []);

        daySettingsResult.forEach((daySetting) => {
            const day = daySetting.day;
            const recurringPlansId = daySetting.recurringPlansId;
            recurringPlansIdsForEachDayId[day].push(recurringPlansId);
            // recurringPlansIds プロパティを追加
            daySetting.recurringPlansIds = recurringPlansIdsForEachDayId[day];
        });

        daySettingsResult.forEach((daySetting) => {
            daySetting.id = daySetting.daySettingsId;
            delete daySetting.daySettingsId;
            delete daySetting.recurringPlansId;
        });
        //オブジェクトの重複を削除
        const uniqueDaySettingsResult = Array.from(new Set(daySettingsResult.map(JSON.stringify)), JSON.parse);

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            recurringPlans: recurringPlansResult,
            daySettings: uniqueDaySettingsResult
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
