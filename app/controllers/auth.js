'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { promisify } = require('util');
const crypto = require('crypto');
const pool = require('../db/pool');
const loginCheck = require('../middlewares/loginCheck');
const daySettingsHelper = require('../helpers/daySettingsHelper');
const dbHelper = require('../helpers/dbHelper');

/**
 * サインアップ
 */
router.post('/signup', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const salt = crypto.randomBytes(16).toString('base64');
    let isClientError = false;

    const client = await pool.connect();

    try {
        // TODO バリデーションチェックを行う

        client.query('BEGIN');

        const checkEmailExistenceResult = await dbHelper.query(client, 'SELECT * FROM users WHERE email = $1', [email]);
        if (checkEmailExistenceResult.rows.length > 0) {
            isClientError = true;
            throw new Error('そのメールアドレスは既に使用されています。');
        }

        const hashedPassword = await promisify(crypto.pbkdf2)(password, salt, 310000, 32, 'sha256');

        const isGuest = req.user && req.user.is_guest;
        const sql = isGuest
            ? 'UPDATE users SET email = $1, hashed_password = $2, salt = $3, is_guest = $4 WHERE id = $5 RETURNING *'
            : 'INSERT INTO users (email, hashed_password, salt, is_guest) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = isGuest
            ? [email, hashedPassword.toString('base64'), salt, false, req.user.id]
            : [email, hashedPassword.toString('base64'), salt, false];

        const signupUserResult = await dbHelper.query(client, sql, values);

        const userId = signupUserResult.rows[0].id;
        await daySettingsHelper.initDaySettings(client, userId);

        await client.query('COMMIT');
        return res.status(200).json({
            isError: false
        });
    } catch (e) {
        client.query('ROLLBACK');
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
    } finally {
        client.release();
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
    // TODO: csrfトークンが必要になったタイミングでコメントアウトを外す
    // return res.json({
    //     isError: false,
    //     isLogin: !!req.user,
    //     isGuest: !!req.user && req.user.is_guest,
    //     _csrf: req.csrfToken()
    // });

    return res.json({
        isError: false,
        isLogin: !!req.user,
        isGuest: !!req.user && req.user.is_guest
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
    console.error('ログインに失敗しました。');
    res.status(400).json({
        isError: true,
        errorId: 'errorId',
        errorMessage: 'ログインに失敗しました。'
    });
});

module.exports = router;
