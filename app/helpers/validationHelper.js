'use strict';

/**
 * @param {object[]} errors - バリデーションチェックの結果のエラーオブジェクト配列
 * @returns {string[]} - バリデーションエラーメッセージの配列
 */

const errorMessageFormatter = function (errors) {
    return errors.map((error) => error.msg);
};

module.exports = {
    errorMessageFormatter
};
