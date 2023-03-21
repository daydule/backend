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
    if (result.errors.length !== 0) {
        return res.status(400).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: errorMessageFormatter(result.errors)
        });
    }
    next();
};

module.exports = validationResultCheck;
