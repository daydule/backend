'use strict';

const dbHelper = require('../helpers/dbHelper');
const { Client } = require('pg');
const scheduleHelper = require('../helpers/scheduleHelper');

/**
 * スケジュールからリストにTODOを戻す
 *
 * @param {Client} client - DB接続
 * @param {number} userId - ユーザーID
 * @param {number} todoId - TODOのID
 */
async function backToList(client, userId, todoId) {
    const getUserResult = await dbHelper.query(client, 'SELECT * FROM users WHERE id = $1', [userId]);
    const todaySchedule = await scheduleHelper.getTodaySchedule(client, userId);
    const scheduledTodoIds = convertTodoListOrderToArray(todaySchedule.todoOrder);
    const todoListIds = convertTodoListOrderToArray(getUserResult.rows[0].todoListOrder);

    const getTodoResult = await dbHelper.query(client, 'SELECT * FROM plans WHERE id = $1', [todoId]);
    const targetTodo = getTodoResult.rows[0];

    if (!targetTodo) return;

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

        const deletedTodoIds = deletePlansResult.rows.map((todo) => todo.id);

        newScheduledTodoIds = scheduledTodoIds.filter((id) => !deletedTodoIds.includes(id));
        // targetTodoの親予定が最優先になるように戻す
        newTodoListIds = [targetTodo.parentPlanId].concat(todoListIds);

        await dbHelper.query(
            client,
            'UPDATE plans SET date = $1, start_time = $2, end_time = $3, is_scheduled = $4 WHERE id = $5',
            [null, null, null, false, targetTodo.parentPlanId]
        );
    } else {
        newScheduledTodoIds = scheduledTodoIds.filter((id) => id !== targetTodo.id);
        // targetTodoが最優先になるように戻す
        newTodoListIds = [targetTodo.id].concat(todoListIds);

        await dbHelper.query(
            client,
            'UPDATE plans SET date = $1, start_time = $2, end_time = $3, is_scheduled = $4 WHERE id = $5',
            [null, null, null, false, targetTodo.id]
        );
    }

    const newScheduleTodoIdsCsv = newScheduledTodoIds.join(',');
    const newListTodoIdsCsv = newTodoListIds.join(',');
    await dbHelper.query(client, 'UPDATE schedules SET todo_order = $1 WHERE id = $2', [
        newScheduleTodoIdsCsv ? newScheduleTodoIdsCsv : null,
        todaySchedule.id
    ]);
    await dbHelper.query(client, 'UPDATE users SET todo_list_order = $1 WHERE id = $2', [
        newListTodoIdsCsv ? newListTodoIdsCsv : null,
        userId
    ]);
}

/**
 * @param {string} todoListOrder - TODOのIDの並び順csv文字列
 * @returns {number[]} - TODOのIDの並び順配列
 */
function convertTodoListOrderToArray(todoListOrder) {
    if (!todoListOrder) return [];
    return todoListOrder
        .split(',')
        .filter((id) => id)
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
    return order.map((id) => todos.find((todo) => todo.id === id)).filter((todo) => todo !== null);
}

module.exports = {
    backToList,
    sortTodos,
    convertTodoListOrderToArray
};
