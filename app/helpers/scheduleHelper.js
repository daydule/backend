'use strict';

const constant = require('../config/const');

/**
 * スケジュールを作成する
 *
 * @param {object} pool - DB接続
 * @param {number} scheduleLogicId - ロジックID
 * @param {number} userId - ユーザーID
 * @param {number} scheduleId - スケジュールID
 * @param {string} startTime - スケジュール開始時間
 * @param {string} endTime - スケジュール終了時間
 * @param {Array} plans - 予定
 * @param {Array} todos - TODO
 * @returns {object} - スケジュール作成結果
 */
async function createSchedule(pool, scheduleLogicId, userId, scheduleId, startTime, endTime, plans, todos) {
    try {
        const scheduleLogic = require('./schedule/' + constant.SCHEDULE_LOGIC_FILENAME[scheduleLogicId]);
        const result = await scheduleLogic.execute(
            pool,
            userId,
            scheduleLogicId,
            scheduleId,
            startTime,
            endTime,
            plans,
            todos
        );
        return {
            isError: false,
            result: result
        };
    } catch (e) {
        console.error(e);

        return {
            isError: true,
            errorId: 'errorId',
            errorMessage: 'システムエラー'
        };
    }
}

/**
 *
 * @param {object} plan - プロパティがスネークケースの予定オブジェクト
 * @returns {object} - プロパティがローワーキャメルケースの予定オブジェクト
 */
function transferSnakeCaseToLowerCamelCase(plan) {
    return {
        id: plan.id,
        userId: plan.user_id,
        title: plan.title,
        context: plan.context,
        date: plan.date,
        startTime: plan.start_time,
        end_time: plan.end_time,
        processTime: plan.process_time,
        travelTime: plan.travel_time,
        bufferTime: plan.buffer_time,
        planType: plan.plan_type,
        priority: plan.priority,
        place: plan.place,
        isScheduled: plan.is_scheduled,
        isRequiredPlan: plan.is_required_plan,
        parentPlanId: plan.parent_plan_id,
        isParentPlan: plan.is_parent_plan,
        todoStartTime: plan.todo_start_time
    };
}

module.exports = {
    createSchedule: createSchedule,
    transferSnakeCaseToLowerCamelCase: transferSnakeCaseToLowerCamelCase
};
