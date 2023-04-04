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
            errorId: 'ClientError',
            errorMessage: '正常に処理が実行できませんでした。入力値をもう一度お確かめください。'
        });
    }
    next();
}

module.exports = loginCheck;
