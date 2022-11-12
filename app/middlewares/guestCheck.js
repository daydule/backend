'use strict';

/**
 * リクエストにゲストフラグをセットする
 *
 */
function guestCheck(req, res, next) {
    if (!req.user) {
        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: '未ログイン状態です'
        });
    }

    req.isGuest = req.user.is_guest;
    next();
}

module.exports = guestCheck;
