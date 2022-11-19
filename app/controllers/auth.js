'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { promisify } = require('util');
const crypto = require('crypto');
const pool = require('../db/pool');
const loginCheck = require('../middlewares/loginCheck');
const daySettingsHelper = require('../helpers/daySettingsHelper');

/**
 * サインアップ
 */
router.post('/signup', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const salt = crypto.randomBytes(16).toString('base64');
    let isClientError = false;

    try {
        // TODO バリデーションチェックを行う

        const checkEmailExistanceResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkEmailExistanceResult.rows.length > 0) {
            isClientError = true;
            throw new Error('そのメールアドレスは既に使用されています。');
        }

        const hashedPassword = await promisify(crypto.pbkdf2)(password, salt, 310000, 32, 'sha256');

        const isGuest = req.user && req.user.is_guest;
        const sql = isGuest
            ? 'UPDATE users SET email = $1, password = $2, salt = $3, is_guest = $4 WHERE id = $5 RETURNING *'
            : 'INSERT INTO users (email, password, salt, is_guest) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = isGuest
            ? [email, hashedPassword.toString('base64'), salt, false, req.user.id]
            : [email, hashedPassword.toString('base64'), salt, false];

        const signupUserResult = await pool.query(sql, values);

        const userId = signupUserResult.rows[0].id;
        const daySettingList = await daySettingsHelper.initDaySettings(pool, userId);

        return res.status(200).json({
            isError: false,
            user: {
                userName: signupUserResult.rows[0].user_name,
                email: signupUserResult.rows[0].email,
                isGuest: signupUserResult.rows[0].is_guest
            },
            daySettingList: daySettingList
        });
    } catch (e) {
        console.error(e);
        if (isClientError) {
            return res.status(400).json({
                isError: true,
                errorId: 'errorId',
                errorMessage: 'サインアップエラー'
            });
        } else {
            return res.status(500).json({
                isError: true,
                errorId: 'errorId',
                errorMessage: 'サインアップエラー'
            });
        }
    }
});

/**
 * ログイン
 */
router.post('/login', passport.authenticate('local', { failureRedirect: '/authError' }), (req, res) => {
    res.status(200).json({
        isError: false
    });
});

/**
 * ゲストチェック
 */
router.get('/guestCheck', function (req, res) {
    // ここでcsrfトークンを返しているのは、ここじゃないとログインチェックで弾かれてgetできないから
    // TODO: どこでcsrfトークンを取得するか決定したら、csrfトークン返さなくする
    return res.json({
        isError: false,
        isLogin: !!req.user,
        isGuest: !!req.user && req.user.is_guest,
        _csrf: req.csrfToken()
    });
});

/**
 * ログアウト
 */
router.post('/logout', loginCheck, function (req, res) {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                isError: true,
                errorId: 'errorId',
                errorMessage: err
            });
        } else {
            return res.status(200).json({
                isError: false
            });
        }
    });
});

/**
 * 認証エラー時のレスポンスを返却する
 */
router.get('/authError', (req, res) => {
    res.status(400).json({
        isError: true,
        errorId: 'errorId',
        errorMessage: '認証エラー'
    });
});

module.exports = router;
