'use strict';

const dbHelper = require('../helpers/dbHelper');
const { Client } = require('pg');

/**
 * スケジュールからリストにTODOを戻す
 *
 * @param {Client} client - DB接続
 * @param {number} userId - ユーザーID
 * @param {number} todoId - TODOのID
 */
async function backToList(client, userId, todoId) {
    const getUserResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);
    const scheduledTodoIds = getUserResult.rows[0].scheduledTodoOrder
        ? convertTodoListOrderToArray(getUserResult.rows[0].scheduledTodoOrder)
        : [];
    const todoListIds = getUserResult.rows[0].todoListOrder
        ? convertTodoListOrderToArray(getUserResult.rows[0].todoListOrder)
        : [];

    const getTodoResult = await dbHelper.query(client, 'SELECT * FROM plans WHERE id = $1', [todoId]);
    const targetTodo = getTodoResult.rows[0];

    let newScheduledTodoIds;
    let newTodoListIds;

    // NOTE: 親予定はそのままスケジュールに入ることはないため、todoIdとして指定される
    if (targetTodo.parentPlanId) {
        // NOTE: 子予定だったら、兄弟を全て削除
        const deletePlansResult = await dbHelper.query(
            client,
            'DELETE from plans WHERE parent_plan_id = $1 RETURNING *',
            [targetTodo.parentPlanId]
        );

        newScheduledTodoIds = scheduledTodoIds.filter(
            (id) => !deletePlansResult.rows.map((plan) => plan.id).include(id)
        );
        newTodoListIds = todoListIds.concat(targetTodo.parentPlanId);

        await dbHelper.query(
            client,
            'UPDATE plans SET date = $1, start_time = $2, end_time = $3, is_scheduled = $4 WHERE id = $5',
            [null, null, null, false, targetTodo.parentPlanId]
        );
    } else {
        newScheduledTodoIds = scheduledTodoIds.filter((id) => id !== targetTodo.id);
        newTodoListIds = todoListIds.concat(targetTodo.id);

        await dbHelper.query(
            client,
            'UPDATE plans SET date = $1, start_time = $2, end_time = $3, is_scheduled = $4 WHERE id = $5',
            [null, null, null, false, targetTodo.id]
        );
    }

    const newScheduleTodoIdsCsv = newScheduledTodoIds.join(',');
    const newListTodoIdsCsv = newTodoListIds.join(',');
    await dbHelper.query(client, 'UPDATE users SET scheduled_todo_order = $1 WHERE id = $2', [
        newScheduleTodoIdsCsv ? newScheduleTodoIdsCsv : null,
        userId
    ]);
    await dbHelper.query(client, 'UPDATE users SET todo_list_order = $1 WHERE id = $2', [
        newListTodoIdsCsv ? newListTodoIdsCsv : null,
        userId
    ]);
}

/**
 * @param {string} todoListOrder - TODOのIDの並び順csv文字列
 * @returns {number[] | null} - TODOのIDの並び順配列
 */
function convertTodoListOrderToArray(todoListOrder) {
    return todoListOrder
        ?.split(',')
        ?.filter((id) => id)
        .map((id) => Number(id));
}

/**
 * TODOを並び替える
 *
 * @param {object[]} todos - todoオブジェクト配列
 * @param {number[]} order - todoの並び順を決めるID配列
 * @returns {object[]} - 並び替えられたtodoオブジェクト配列
 */
function sortTodos(todos, order) {
    return order == null
        ? todos
        : order.map((id) => todos.find((todo) => todo.id === id)).filter((todo) => todo !== null);
}

module.exports = {
    backToList,
    sortTodos,
    convertTodoListOrderToArray
};
