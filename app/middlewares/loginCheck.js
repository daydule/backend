'use strict';

function loginCheck(req, res, next) {
    if (!req.user) {
        return res.status(400).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: '未ログインエラー'
        });
    }
    next();
}

module.exports = loginCheck;
