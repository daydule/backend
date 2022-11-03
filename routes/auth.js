'use strict';

const express = require('express');
const router = express.Router();

router.post('/signup', (req, res, next) => {
    // TODO バリデーションチェックを行う

    // TODO メールアドレスチェック

    // TODO ゲストユーザーチェック

    // TODO サインアップ処理

    // TODO 曜日別設定

    res.json({
        isError: false
    });
    return next();
});

router.post('/login', (req, res, next) => {
    // TODO バリデーションチェックを行う

    // TODO ログイン処理を行う

    res.json({
        isError: false
    });
    return next();
});

module.exports = router;
