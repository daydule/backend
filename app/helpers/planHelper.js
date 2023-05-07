'use strict';

const dbHelper = require('../helpers/dbHelper');
const { Client } = require('pg');

/**
 * スケジュールからリストにTODOを戻す
 *
 * @param {Client} client - DB接続
 * @param {number} userId - ユーザーID
 * @param {number} todoId - TOODのID
 */
async function backToList(client, userId, todoId) {
    const getUserResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);
    const scheduledTodoIds = getUserResult.rows[0].scheduledTodoOrder
        ? getUserResult.rows[0].scheduledTodoOrder.split(',')
        : [];
    const listTodoIds = getUserResult.rows[0].todoListOrder ? getUserResult.rows[0].todoListOrder.split(',') : [];

    const getTodoResult = await dbHelper.query(client, 'SELECT * FROM plans WHERE id = $1', [todoId]);
    const targetTodo = getTodoResult.rows[0];

    let newScheduledTodoIds;
    let newListTodoIds;

    // NOTE: 親予定はそのままスケジュールに入ることはないため、todoIdとして指定されう
    if (targetTodo.parentPlanId) {
        // NOTE: 子予定だったら、兄弟を全て削除
        const deletePlansResult = await dbHelper.query(
            client,
            'DELETE from plans WHERE parent_plan_id = $1 RETURNING *',
            [targetTodo.parentPlanId]
        );

        newScheduledTodoIds = scheduledTodoIds.filter(
            (id) => !deletePlansResult.rows.map((plan) => plan.id).include(Number(id))
        );
        newListTodoIds = listTodoIds.concat(targetTodo.parentPlanId);

        await dbHelper.query(
            client,
            'UPDATE plans SET date = $1, start_time = $2, end_time = $3, is_scheduled = $4 WHERE id = $5',
            [null, null, null, false, targetTodo.parentPlanId]
        );
    } else {
        newScheduledTodoIds = scheduledTodoIds.filter((id) => Number(id) !== targetTodo.id);
        newListTodoIds = listTodoIds.concat(targetTodo.id);

        await dbHelper.query(
            client,
            'UPDATE plans SET date = $1, start_time = $2, end_time = $3, is_scheduled = $4 WHERE id = $5',
            [null, null, null, false, targetTodo.id]
        );
    }

    const newScheduleTodoIdsCsv = newScheduledTodoIds.join(',');
    const newListTodoIdsCsv = newListTodoIds.join(',');
    await dbHelper.query(client, 'UPDATE users SET scheduled_todo_order = $1 WHERE id = $2', [
        newScheduleTodoIdsCsv ? newScheduleTodoIdsCsv : null,
        userId
    ]);
    await dbHelper.query(client, 'UPDATE users SET todo_list_order = $1 WHERE id = $2', [
        newListTodoIdsCsv ? newListTodoIdsCsv : null,
        userId
    ]);
}

module.exports = {
    backToList
};
