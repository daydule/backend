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
 * 予定削除
 */
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const getPlanResult = await client.query('SELECT * from plans where id = $1', [id]);
        if (getPlanResult.rows.length === 0) {
            throw new Error('There is no plan with id(' + id + ').');
        }
        await client.query('DELETE from plans where id = $1', [id]);
        await client.query('COMMIT');
        return res.status(200).json({
            isError: false
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
 * 予定更新（スケジュール作成後）
 */
router.post('/temporary/:id/update', async (req, res) => {
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
    const isTimeOrDateChanged = req.body.isTimeOrDateChanged;
    const planId = req.params.id;

    const client = await pool.connect();

    try {
        // TODO: バリデーションチェックを行う

        await client.query('BEGIN');

        const getPlanResult = await client.query('SELECT * from plans where id = $1', [planId]);
        if (getPlanResult.rows.length === 0) {
            throw new Error('There is no plan with id(' + planId + ').');
        }

        if (getPlanResult.rows[0].parent_plan_id && !isTimeOrDateChanged) {
            // 変更対象が分割予定、かつ時間や日付の更新ではない場合

            // 分割元予定の更新
            const updateParentPlanResult = await client.query(
                'UPDATE temporary_plans SET title = $1, context = $2, priority = $3, place = $4 WHERE original_plan_id = $5 RETURNING *',
                [title, context, priority, place, getPlanResult.rows[0].parent_plan_id]
            );
            if (updateParentPlanResult.rows.length === 0) {
                const getParentPlanResult = await client.query('SELECT * from plans where id = $1', [
                    getPlanResult.rows[0].parent_plan_id
                ]);
                await pool.query(
                    'INSERT INTO temporary_plans (\
                        original_plan_id, user_id, title, context, date, start_time, end_time, process_time, \
                        travel_time, buffer_time, plan_type, priority, place, todo_start_time) \
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                    [
                        getParentPlanResult.rows[0].id,
                        getParentPlanResult.rows[0].user_id,
                        title,
                        context,
                        getParentPlanResult.rows[0].date,
                        getParentPlanResult.rows[0].start_time,
                        getParentPlanResult.rows[0].end_time,
                        getParentPlanResult.rows[0].process_time,
                        getParentPlanResult.rows[0].travel_time,
                        getParentPlanResult.rows[0].buffer_time,
                        getParentPlanResult.rows[0].plan_type,
                        priority,
                        place,
                        getParentPlanResult.rows[0].todo_start_time
                    ]
                );
            }

            // 分割予定
            const getDividedPlans = await client.query('SELECT * from plans where parent_plan_id = $1', [
                getPlanResult.rows[0].parent_plan_id
            ]);
            for (let i = 0; i < getDividedPlans.rows.length; i++) {
                const updateDividedPlanResult = await client.query(
                    'UPDATE temporary_plans SET title = $1, context = $2, priority = $3, place = $4 WHERE original_plan_id = $5 RETURNING *',
                    [title, context, priority, place, getDividedPlans.rows[i].id]
                );

                if (updateDividedPlanResult.rows.length === 0) {
                    await pool.query(
                        'INSERT INTO temporary_plans (\
                            original_plan_id, user_id, title, context, date, start_time, end_time, process_time, \
                            travel_time, buffer_time, plan_type, priority, place, todo_start_time) \
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                        [
                            getDividedPlans.rows[i].id,
                            userId,
                            title,
                            context,
                            getDividedPlans.rows[i].date,
                            getDividedPlans.rows[i].start_time,
                            getDividedPlans.rows[i].end_time,
                            getDividedPlans.rows[i].process_time,
                            getDividedPlans.rows[i].travel_time,
                            getDividedPlans.rows[i].buffer_time,
                            getDividedPlans.rows[i].plan_type,
                            priority,
                            place,
                            getDividedPlans.rows[i].todo_start_time
                        ]
                    );
                }
            }
        } else {
            if (getPlanResult.rows[0].is_parent_plan) {
                // 変更対象が分割元予定の場合

                // 分割予定の更新
                const getDividedPlans = await client.query('SELECT * from plans where parent_plan_id = $1', [planId]);
                for (let i = 0; i < getDividedPlans.rows.length; i++) {
                    let updateDividedPlanResult = null;
                    if (isTimeOrDateChanged) {
                        updateDividedPlanResult = await client.query(
                            'UPDATE temporary_plans SET is_deleted = $1 WHERE original_plan_id = $2 RETURNING *',
                            [true, getDividedPlans.rows[i].id]
                        );
                    } else {
                        updateDividedPlanResult = await client.query(
                            'UPDATE temporary_plans SET title = $1, context = $2, priority = $3, place = $4 WHERE original_plan_id = $5 RETURNING *',
                            [title, context, priority, place, getDividedPlans.rows[i].id]
                        );
                    }

                    if (updateDividedPlanResult.rows.length === 0) {
                        await pool.query(
                            'INSERT INTO temporary_plans (\
                                original_plan_id, user_id, title, context, date, start_time, end_time, process_time, \
                                travel_time, buffer_time, plan_type, priority, place, is_deleted, todo_start_time) \
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
                            [
                                getDividedPlans.rows[i].id,
                                userId,
                                title,
                                context,
                                getDividedPlans.rows[i].date,
                                getDividedPlans.rows[i].start_time,
                                getDividedPlans.rows[i].end_time,
                                getDividedPlans.rows[i].process_time,
                                getDividedPlans.rows[i].travel_time,
                                getDividedPlans.rows[i].buffer_time,
                                getDividedPlans.rows[i].plan_type,
                                priority,
                                place,
                                isTimeOrDateChanged, // 時間や日付変更の場合は削除フラグを立てる
                                getDividedPlans.rows[i].todo_start_time
                            ]
                        );
                    }
                }
            }

            const updateResult = await client.query(
                'UPDATE temporary_plans SET original_plan_id = $1, user_id = $2, title = $3, context = $4, date = $5, \
                start_time = $6, end_time = $7, process_time = $8, travel_time = $9, buffer_time = $10, plan_type = $11, \
                priority = $12, place = $13, todo_start_time = $14 WHERE original_plan_id = $15 RETURNING *',
                [
                    planId,
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
                    todoStartTime,
                    planId
                ]
            );
            if (updateResult.rows.length === 0) {
                await pool.query(
                    'INSERT INTO temporary_plans (\
                        original_plan_id, user_id, title, context, date, start_time, end_time, process_time, \
                        travel_time, buffer_time, plan_type, priority, place, todo_start_time) \
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                    [
                        planId,
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
            }
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
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    } finally {
        client.release();
    }
});

/**
 * 予定削除（スケジュール作成後）
 */
router.post('/temporary/:id/delete', async (req, res) => {
    const userId = req.user.id;
    const planId = req.params.id;

    const client = await pool.connect();

    try {
        // TODO: バリデーションチェックを行う

        await client.query('BEGIN');

        const getPlanResult = await client.query('SELECT * from plans where id = $1', [planId]);
        if (getPlanResult.rows.length === 0) {
            throw new Error('There is no plan with id(' + planId + ').');
        }

        const updateResult = await client.query(
            'UPDATE temporary_plans SET is_deleted = $1 WHERE original_plan_id = $2 RETURNING *',
            [true, planId]
        );
        if (updateResult.rows.length === 0) {
            await pool.query(
                'INSERT INTO temporary_plans (\
                    original_plan_id, user_id, title, context, date, start_time, end_time, process_time, \
                    travel_time, buffer_time, plan_type, priority, place, is_deleted, todo_start_time) \
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
                [
                    getPlanResult.rows[0].id,
                    userId,
                    getPlanResult.rows[0].title,
                    getPlanResult.rows[0].context,
                    getPlanResult.rows[0].date,
                    getPlanResult.rows[0].startTime,
                    getPlanResult.rows[0].endTime,
                    getPlanResult.rows[0].processTime,
                    getPlanResult.rows[0].travelTime,
                    getPlanResult.rows[0].bufferTime,
                    getPlanResult.rows[0].planType,
                    getPlanResult.rows[0].priority,
                    getPlanResult.rows[0].place,
                    true,
                    getPlanResult.rows[0].todoStartTime
                ]
            );
        }

        if (getPlanResult.rows[0].is_parent_plan) {
            const getDividedPlans = await client.query('SELECT * from plans where parent_plan_id = $1', [planId]);
            for (let i = 0; i < getDividedPlans.rows.length; i++) {
                const updateResult = await client.query(
                    'UPDATE temporary_plans SET is_deleted = $1 WHERE original_plan_id = $2 RETURNING *',
                    [true, getDividedPlans.rows[i].id]
                );
                if (updateResult.rows.length === 0) {
                    await pool.query(
                        'INSERT INTO temporary_plans (\
                            original_plan_id, user_id, title, context, date, start_time, end_time, process_time, \
                            travel_time, buffer_time, plan_type, priority, place, is_deleted, todo_start_time) \
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
                        [
                            getDividedPlans.rows[i].id,
                            userId,
                            getDividedPlans.rows[i].title,
                            getDividedPlans.rows[i].context,
                            getDividedPlans.rows[i].date,
                            getDividedPlans.rows[i].startTime,
                            getDividedPlans.rows[i].endTime,
                            getDividedPlans.rows[i].processTime,
                            getDividedPlans.rows[i].travelTime,
                            getDividedPlans.rows[i].bufferTime,
                            getDividedPlans.rows[i].planType,
                            getDividedPlans.rows[i].priority,
                            getDividedPlans.rows[i].place,
                            true,
                            getDividedPlans.rows[i].todoStartTime
                        ]
                    );
                }
            }
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
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        });
    } finally {
        client.release();
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
