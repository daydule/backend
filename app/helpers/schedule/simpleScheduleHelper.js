'use strict';

const constant = require('../../config/const');
const timeUtil = require('../../utils/time');
const { Client } = require('pg');

/**
 * 空き時間に予定を入れれるかチェックし、可能な場合は開始時間のインデックスを返す
 *
 * @param {Array} freeSections - 空き時間配列
 * @param {number} sectionNum - 必要なセクション数
 * @returns {number} - セクションが入る時間の開始インデックス
 */
function findAvailableSectionStartIndex(freeSections, sectionNum) {
    let count = 0;
    for (let i = 0; i < freeSections.length; i++) {
        if (freeSections[i] === 0) {
            count++;
        } else {
            count = 0;
        }
        if (count === sectionNum) {
            return i - count + 1;
        }
    }
    return -1;
}

/**
 * シンプルスケジュールを作成する
 *
 * @param {Client} client - DB接続
 * @param {number} userId - ユーザーID
 * @param {number} scheduleId - スケジュールID
 * @param {string} startTimeStr - スケジュール開始時間
 * @param {string} endTimeStr - スケジュール終了時間
 * @param {Array} plans - 予定
 * @param {Array} todos - 優先度降順のTODO
 * @param {string} date - 日付
 * @returns {object} - スケジュール作成結果
 */
async function execute(client, userId, scheduleId, startTimeStr, endTimeStr, plans, todos, date) {
    if (todos.length === 0) {
        return {
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        };
    }

    const hasInvalidRequiredPlan = plans.some((plan) => {
        // 必須予定の開始時間がスケジュール開始時間より早い、または必須予定の終了時間がスケジュール終了時間より遅いか
        return (
            timeUtil.compareTimeStr(plan.startTime, startTimeStr) === -1 ||
            timeUtil.compareTimeStr(plan.endTime, endTimeStr) === 1
        );
    });
    if (hasInvalidRequiredPlan) {
        return {
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        };
    }

    // 空き時間配列
    // 開始時間から終了時間をセクションという単位で分割し、セクションごとに予定があれば1、予定がなければ0を設定する
    // 例) 開始時間：0900、終了時間：1800、1セクション：5分、かつ1000~1100に予定が入っている場合
    //     0900~1000（0セクション~11セクション）、1100~1800（24セクション~107セクション）の間は予定がないため、値は0
    //     1000~1100（12セクション~23セクション）の間は予定があるため、値は1
    let freeSections = new Array(timeUtil.subtractTimeStr(endTimeStr, startTimeStr) / constant.SECTION_MINUTES_LENGTH);
    freeSections.fill(0);

    let remainingFreeTimeMin = freeSections.length * constant.SECTION_MINUTES_LENGTH;

    const requiredPlans = [];
    const optionalPlans = [];
    plans.forEach((plan) => {
        // 呼び出し元に必須予定と仮の予定を分けて返すため、別配列にPUSH
        if (plan.isRequiredPlan) {
            requiredPlans.push(plan);

            // 空き時間のうち予定が入っている箇所を1で埋める
            let processTimeMin = timeUtil.subtractTimeStr(plan.endTime, plan.startTime);
            let startIndex = timeUtil.subtractTimeStr(plan.startTime, startTimeStr) / constant.SECTION_MINUTES_LENGTH;
            let endIndex = startIndex + processTimeMin / constant.SECTION_MINUTES_LENGTH;

            freeSections.fill(1, startIndex, endIndex);
            remainingFreeTimeMin -= processTimeMin;
        } else {
            optionalPlans.push(plan);
        }
    });

    const scheduledTodos = [];
    const notScheduledTodos = [];
    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];
        if (todo.processTime > remainingFreeTimeMin) {
            notScheduledTodos.push(todo);
        } else {
            const needSectionNum = todo.processTime / constant.SECTION_MINUTES_LENGTH;
            const availableTimeStartIndex = findAvailableSectionStartIndex(freeSections, needSectionNum);

            if (availableTimeStartIndex !== -1) {
                freeSections.fill(1, availableTimeStartIndex, availableTimeStartIndex + needSectionNum);
                remainingFreeTimeMin -= needSectionNum * constant.SECTION_MINUTES_LENGTH;

                await client.query('INSERT INTO schedule_plan_inclusion (plan_id, schedule_id) VALUES ($1, $2)', [
                    todo.id,
                    scheduleId
                ]);
                const startAndEndTimeStr = timeUtil.getStartAndEndTimeStr(
                    startTimeStr,
                    availableTimeStartIndex * constant.SECTION_MINUTES_LENGTH,
                    todo.processTime
                );
                const updatedTodo = await client.query(
                    'UPDATE plans SET start_time = $1, end_time = $2, date = $3, is_scheduled = $4 WHERE id = $5 RETURNING *',
                    [startAndEndTimeStr.startTime, startAndEndTimeStr.endTime, date, true, todo.id]
                );

                scheduledTodos.push(updatedTodo.rows[0]);
            } else {
                const availableSectionIndex = [];
                for (let j = 0; j < freeSections.length; j++) {
                    if (availableSectionIndex.length === needSectionNum) {
                        break;
                    }

                    if (freeSections[j] === 0) {
                        availableSectionIndex.push(j);
                    }
                }

                availableSectionIndex.forEach((index) => {
                    freeSections[index] = 1;
                });
                remainingFreeTimeMin -= needSectionNum * constant.SECTION_MINUTES_LENGTH;

                const dividedTodoTime = [];
                for (let j = 0; j < availableSectionIndex.length; j++) {
                    let processTimeMin = constant.SECTION_MINUTES_LENGTH;
                    let sequenceCount = 0;
                    for (let k = j; k < availableSectionIndex.length - 1; k++) {
                        let isSequence = availableSectionIndex[k] + 1 === availableSectionIndex[k + 1];
                        if (isSequence) {
                            processTimeMin += constant.SECTION_MINUTES_LENGTH;
                            sequenceCount += 1;
                        } else {
                            break;
                        }
                    }

                    const startAndEndTimeStr = timeUtil.getStartAndEndTimeStr(
                        startTimeStr,
                        availableSectionIndex[j] * constant.SECTION_MINUTES_LENGTH,
                        processTimeMin
                    );

                    dividedTodoTime.push({
                        startIndex: availableSectionIndex[j],
                        startTime: startAndEndTimeStr.startTime,
                        endTime: startAndEndTimeStr.endTime,
                        processTime: processTimeMin
                    });
                    j += sequenceCount;
                }

                for (let j = 0; j < dividedTodoTime.length; j++) {
                    const todoTime = dividedTodoTime[j];
                    const dividedTodoCreateResult = await client.query(
                        'INSERT INTO plans (\
                            user_id, title, context, date, start_time, end_time, process_time, travel_time, buffer_time, plan_type, \
                            priority, place, is_scheduled, is_required_plan, parent_plan_id, todo_start_time) \
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
                        [
                            userId,
                            todo.title,
                            todo.context,
                            date,
                            todoTime.startTime,
                            todoTime.endTime,
                            todoTime.processTime,
                            j === 0 ? todo.travelTime : 0, // 最初だけ設定
                            j === dividedTodoTime.length - 1 ? todoTime.bufferTime : 0, // 最後だけ設定
                            todo.planType,
                            todo.priority,
                            todo.place,
                            true,
                            todo.isRequiredPlan,
                            todo.id,
                            todo.todoStartTime
                        ]
                    );

                    await client.query('INSERT INTO schedule_plan_inclusion (plan_id, schedule_id) VALUES ($1, $2)', [
                        dividedTodoCreateResult.rows[0].id,
                        scheduleId
                    ]);

                    scheduledTodos.push(dividedTodoCreateResult.rows[0]);
                }

                await client.query('UPDATE plans SET is_scheduled = $1, is_parent_plan = $2 WHERE id = $3', [
                    true,
                    true,
                    todo.id
                ]);
            }
        }
    }

    return {
        isError: false,
        schedule: {
            requiredPlans: requiredPlans,
            todos: scheduledTodos,
            optionalPlans: optionalPlans
        },
        other: {
            todos: notScheduledTodos
        }
    };
}

module.exports = {
    execute: execute
};
