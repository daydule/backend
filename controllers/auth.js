'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');

/**
 * サインアップ
 */
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

/**
 * ログイン
 */
router.post('/login', passport.authenticate('local', { failureRedirect: '/notFound' }), (req, res, next) => {
    // TODO バリデーションチェックを行う

    // TODO ログイン処理を行う

    res.json({
        isError: false
    });
    return next();
});

module.exports = router;
