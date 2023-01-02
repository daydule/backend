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
 * @returns {number} - 比較結果
 */
function subtractTimeStr(timeStr1, timeStr2) {
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

    return (date1.getTime() - date2.getTime()) / 60000;
}

module.exports = {
    compareTimeStr: compareTimeStr,
    subtractTimeStr: subtractTimeStr
};
