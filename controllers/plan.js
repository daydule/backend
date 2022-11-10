'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/**
 * TODO並び順の作成/更新処理
 */
router.post('/upsertTodoPriority', async (req, res) => {
    const todoOrders = req.body.todoOrders; // TODOのIDをカンマ区切りにした文字列

    // TODO バリデーションチェックを行う

    // TODO並び順の取得（履歴用ではなく、ユーザーに一つだけ紐づく並び順を取得）
    const result = await pool.query('SELECT * FROM todo_orders WHERE user_id = $1 AND schedule_id IS NULL', [
        req.user.id
    ]);

    if (result.rows.length > 0) {
        await pool.query('UPDATE todo_orders SET todo_orders = $1 WHERE id = $2', [todoOrders, result.rows[0].id]);
    } else {
        await pool.query('INSERT INTO todo_orders (user_id, todo_orders) VALUES ($1, $2)', [req.user.id, todoOrders]);
    }

    return res.status(200).json({
        isError: false,
        todoOrders: todoOrders
    });
});

module.exports = router;
