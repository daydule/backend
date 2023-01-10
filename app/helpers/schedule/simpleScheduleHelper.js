'use strict';

const { Pool } = require('pg');
const constant = require('../../config/const');
const timeUtil = require('../../utils/time');

/**
 * 空き時間に予定を入れれるかチェックし、可能な場合は開始時間のインデックスを返す
 *
 * @param {Array} freeTime - 空き時間配列
 * @param {number} sectionNum - 必要なセクション数
 * @returns {number} - セクションが入る時間の開始インデックス
 */
function findAvailableTime(freeTime, sectionNum) {
    let count = 0;
    let foundIndex = null;
    for (let i = 0; i < freeTime.length; i++) {
        if (count >= sectionNum || freeTime[i] === 1) {
            continue;
        }

        count = 0;
        for (let j = i; j < freeTime.length; j++) {
            if (freeTime[j] === 0) {
                count++;
            } else {
                break;
            }
        }

        if (count >= sectionNum) {
            foundIndex = i;
        }
    }

    return foundIndex !== null ? foundIndex : -1;
}

/**
 * シンプルスケジュールを作成する
 *
 * @param {Pool} pool - DB接続
 * @param {number} userId - ユーザーID
 * @param {number} scheduleId - スケジュールID
 * @param {string} startTime - スケジュール開始時間
 * @param {string} endTime - スケジュール終了時間
 * @param {Array} plans - 予定
 * @param {Array} todos - TODO
 * @returns {object} - スケジュール作成結果
 */
async function execute(pool, userId, scheduleId, startTime, endTime, plans, todos) {
    // TODO: バリデーション

    if (todos.length === 0) {
        return {
            isError: true
        };
    }

    const hasInvalidRequiredPlan = plans.some((plan) => {
        // 必須予定の開始時間がスケジュール開始時間より早い、または必須予定の終了時間がスケジュール終了時間より遅いか
        return (
            timeUtil.compareTimeStr(plan.start_time, startTime) === -1 ||
            timeUtil.compareTimeStr(plan.end_time, endTime) === 1
        );
    });
    if (hasInvalidRequiredPlan) {
        return {
            isError: true
        };
    }

    // 空き時間配列
    // 開始時間から終了時間をセクションという単位で分割し、セクションごとに予定があれば1、予定がなければ0を設定する
    // 例) 開始時間：0900、終了時間：1800、1セクション：5分、かつ1000~1100に予定が入っている場合
    //     0900~1000（0セクション~11セクション）、1100~1800（24セクション~107セクション）の間は予定がないため、値は0
    //     1000~1100（12セクション~23セクション）の間は予定があるため、値は1
    let freeTime = new Array(timeUtil.subtractTimeStr(endTime, startTime) / constant.SECTION_MINUTES_LENGTH);
    freeTime.fill(0);

    let freeTimeSum = freeTime.length * constant.SECTION_MINUTES_LENGTH;

    const requiredPlans = [];
    const optionalPlans = [];
    plans.forEach((plan) => {
        // 呼び出し元に必須予定と仮の予定を分けて返すため、別配列にPUSH
        if (plan.is_required_plan) {
            requiredPlans.push(plan);

            // 空き時間のうち予定が入っている箇所を1で埋める
            let processTime = timeUtil.subtractTimeStr(plan.end_time, plan.start_time);
            let startIndex = timeUtil.subtractTimeStr(plan.start_time, startTime) / constant.SECTION_MINUTES_LENGTH;
            let endIndex = startIndex + processTime / constant.SECTION_MINUTES_LENGTH;

            freeTime.fill(1, startIndex, endIndex);
            freeTimeSum -= processTime;
        } else {
            optionalPlans.push(plan);
        }
    });

    const scheduledTodos = [];
    const notScheduledTodos = [];
    await todos.forEach(async (todo) => {
        if (todo.process_time > freeTimeSum) {
            notScheduledTodos.push(todo);
        } else {
            const needSectionNum = todo.process_time / constant.SECTION_MINUTES_LENGTH;
            const availableTimeStartIndex = findAvailableTime(freeTime, needSectionNum);

            if (availableTimeStartIndex !== -1) {
                freeTime.fill(1, availableTimeStartIndex, availableTimeStartIndex + needSectionNum);
                freeTimeSum -= needSectionNum * constant.SECTION_MINUTES_LENGTH;

                await pool.query('INSERT INTO schedule_plan_inclusion (plan_id, schedule_id) VALUES ($1, $2)', [
                    todo.id,
                    scheduleId
                ]);
                const startAndEndTimeStr = timeUtil.getStartAndEndTimeStr(
                    startTime,
                    availableTimeStartIndex * constant.SECTION_MINUTES_LENGTH,
                    todo.process_time
                );
                await pool.query('UPDATE plans SET start_time = $1, end_time = $2, is_scheduled = $3 WHERE id = $4', [
                    startAndEndTimeStr.startTime,
                    startAndEndTimeStr.endTime,
                    true,
                    todo.id
                ]);

                scheduledTodos.push(todo);
            } else {
                const availableSectionIndex = [];
                for (let i = 0; i < freeTime.length; i++) {
                    if (availableSectionIndex.length === needSectionNum) {
                        break;
                    }

                    if (freeTime[i] === 0) {
                        availableSectionIndex.push(i);
                    }
                }

                availableSectionIndex.forEach((index) => {
                    freeTime[index] = 1;
                });
                freeTimeSum -= needSectionNum * constant.SECTION_MINUTES_LENGTH;

                const divisionTodoTime = [];
                for (let i = 0; i < availableSectionIndex.length; i++) {
                    let processTime = constant.SECTION_MINUTES_LENGTH;
                    let sequenceCount = 0;
                    for (let j = i; j < availableSectionIndex.length - 1; j++) {
                        let isSequence = availableSectionIndex[j] + 1 === availableSectionIndex[j + 1];
                        if (isSequence) {
                            processTime += constant.SECTION_MINUTES_LENGTH;
                            sequenceCount += 1;
                        } else {
                            break;
                        }
                    }

                    const startAndEndTimeStr = timeUtil.getStartAndEndTimeStr(
                        startTime,
                        availableSectionIndex[i] * constant.SECTION_MINUTES_LENGTH,
                        processTime
                    );

                    divisionTodoTime.push({
                        startIndex: availableSectionIndex[i],
                        startTime: startAndEndTimeStr.startTime,
                        endTime: startAndEndTimeStr.endTime,
                        processTime: processTime
                    });
                    i += sequenceCount;
                }

                divisionTodoTime.forEach(async (todoTime, index) => {
                    const divisionTodoCreateresult = await pool.query(
                        'INSERT INTO plans (\
                            user_id, title, context, date, start_time, end_time, process_time, travel_time, buffer_time, plan_type, \
                            priority, place, is_scheduled, is_required_plan, parent_plan_id, todo_start_time) \
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
                        [
                            userId,
                            todo.title,
                            todo.context,
                            todo.date,
                            todoTime.startTime,
                            todoTime.endTime,
                            todoTime.processTime,
                            index === 0 ? todo.travel_time : 0, // 最初だけ設定
                            index === divisionTodoTime.length - 1 ? todoTime.buffer_time : 0, // 最後だけ設定
                            todo.plan_type,
                            todo.priority,
                            todo.place,
                            true,
                            todo.is_required_plan,
                            todo.id,
                            todo.todo_start_time
                        ]
                    );

                    await pool.query('INSERT INTO schedule_plan_inclusion (plan_id, schedule_id) VALUES ($1, $2)', [
                        divisionTodoCreateresult.rows[0].id,
                        scheduleId
                    ]);

                    scheduledTodos.push(divisionTodoCreateresult.rows[0]);
                });

                await pool.query('UPDATE plans SET is_parent_plan = $1 WHERE id = $2', [true, todo.id]);
            }
        }
    });

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
