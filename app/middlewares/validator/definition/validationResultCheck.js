'use strict';

const { validationResult } = require('express-validator');
const { errorMessageFormatter } = require('../../../helpers/validationHelper');

/**
 * バリデーション結果をチェックする
 * バリデーションエラーの場合はエラーを返す
 *
 * **バリデーションミドルウェア配列の最後に入れて呼ぶ必要がある**
 */
const validationResultCheck = (req, res, next) => {
    const result = validationResult(req);
    // NOTE: priorityがbodyだけでなく、headerに設定されることがある。その際にバリデーションエラーとなるため、除外
    const errorsExceptHeaders = result.errors.filter((e) => e.param !== 'priority' || e.location !== 'headers');
    if (errorsExceptHeaders.length > 0) {
        console.error('Validation Error: ' + JSON.stringify(result.errors));
        return res.status(400).json({
            isError: true,
            errorId: 'ClientError',
            errorMessage: errorMessageFormatter(result.errors)
        });
    }
    next();
};

module.exports = validationResultCheck;
