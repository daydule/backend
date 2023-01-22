'use strict';

/**
 *  時間文字列の比較
 *  timeStr1の方がtimeStr2より早い：-1
 *  timeStr1の方がtimeStr2と等しい：0
 *  timeStr1の方がtimeStr2より遅い：1
 *
 * @param {string} timeStr1 - 時間書式の文字列1(書式：hhmm)
 * @param {string} timeStr2 - 時間書式の文字列2(書式：hhmm)
 * @returns {number} - 比較結果
 */
function compareTimeStr(timeStr1, timeStr2) {
    const now = new Date();
    const date1 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        timeStr1.slice(0, 2),
        timeStr1.slice(2, 4)
    );
    const date2 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        timeStr2.slice(0, 2),
        timeStr2.slice(2, 4)
    );

    if (date1.getTime() < date2.getTime()) {
        return -1;
    } else if (date1.getTime() === date2.getTime()) {
        return 0;
    } else {
        return 1;
    }
}

/**
 *  時間文字列の差（分数）を計算する
 *
 * @param {string} timeStr1 - 時間書式の文字列1(書式：hhmm)
 * @param {string} timeStr2 - 時間書式の文字列2(書式：hhmm)
 * @returns {number} - 時間の差（分数）
 */
function subtractTimeStr(timeStr1, timeStr2) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    const date1 = new Date(currentYear, currentMonth, currentDate, timeStr1.slice(0, 2), timeStr1.slice(2, 4));
    const date2 = new Date(currentYear, currentMonth, currentDate, timeStr2.slice(0, 2), timeStr2.slice(2, 4));

    return (date1.getTime() - date2.getTime()) / 60000;
}

/**
 *  予定の開始時間・終了時間を計算する
 *
 * @param {string} scheduleStartTime - スケジュールの開始時間(書式：hhmm)
 * @param {number} startTimeDiffBetweenScheduleAndPlan - スケジュールの開始時間と予定の開始時間の差（分）
 * @param {number} processTime - 予定の時間（分）
 * @returns {string} - 開始時間、終了時間
 */
function getStartAndEndTimeStr(scheduleStartTime, startTimeDiffBetweenScheduleAndPlan, processTime) {
    const now = new Date();
    const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        scheduleStartTime.slice(0, 2),
        scheduleStartTime.slice(2, 4)
    );
    start.setTime(start.getTime() + startTimeDiffBetweenScheduleAndPlan * 60 * 1000);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes());
    end.setTime(end.getTime() + processTime * 60 * 1000);

    return {
        startTime: ('0' + start.getHours()).slice(-2) + ('0' + start.getMinutes()).slice(-2),
        endTime: ('0' + end.getHours()).slice(-2) + ('0' + end.getMinutes()).slice(-2)
    };
}

module.exports = {
    compareTimeStr: compareTimeStr,
    subtractTimeStr: subtractTimeStr,
    getStartAndEndTimeStr: getStartAndEndTimeStr
};
