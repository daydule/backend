'use strict';

/**
 * @param {object[]} errors - バリデーションチェックの結果のエラーオブジェクト配列
 * @returns {string[]} - バリデーションエラーメッセージの配列
 */

const errorMessageFormatter = function (errors) {
    return errors.map((error) => {
        return '(' + error.param + ' : ' + error.value + ') ' + error.msg;
    });
};

module.exports = {
    errorMessageFormatter
};
