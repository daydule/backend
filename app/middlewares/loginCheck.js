'use strict';

/**
 * ユーザーがログインしているかチェックをする
 * 未ログインの場合はエラーを返す
 */
function loginCheck(req, res, next) {
    if (!req.user) {
        console.error('未ログインです。');
        console.error('req.user = ', req.user);
        return res.status(400).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: '未ログインです。'
        });
    }
    next();
}

module.exports = loginCheck;
