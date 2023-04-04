'use strict';

/**
 * ユーザーがゲストかどうかチェックする
 * 未ログイン・ゲストユーザーログインの場合はエラーを返す
 */
function guestCheck(req, res, next) {
    if (!req.user) {
        console.error('未ログインです。');
        console.error('req.user = ', req.user);
        return res.status(400).json({
            isError: true,
            errorId: 'ClientError',
            errorMessage: '正常に処理が実行できませんでした。入力値をもう一度お確かめください。'
        });
    }
    if (req.user.is_guest) {
        console.error('ゲストユーザーログインです。');
        console.error('req.user = ', req.user);
        return res.status(400).json({
            isError: true,
            errorId: 'ClientError',
            errorMessage: '正常に処理が実行できませんでした。入力値をもう一度お確かめください。'
        });
    }

    next();
}

module.exports = guestCheck;
