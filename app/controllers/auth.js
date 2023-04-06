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
const { signupValidators } = require('../middlewares/validator/authControllerValidators');

/**
 * サインアップ
 */
router.post('/signup', signupValidators, async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const salt = crypto.randomBytes(16).toString('base64');
    let isClientError = false;

    const client = await pool.connect();

    try {
        client.query('BEGIN');

        const checkEmailExistenceResult = await dbHelper.query(client, 'SELECT * FROM users WHERE email = $1', [email]);
        if (checkEmailExistenceResult.rows.length > 0) {
            isClientError = true;
            throw new Error('Email is already registered.');
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
                errorId: 'ClientError',
                errorMessage: '正常に処理が実行できませんでした。入力値をもう一度お確かめください。'
            });
        } else {
            return res.status(500).json({
                isError: true,
                errorId: 'ServerError',
                errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
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
            console.error(err);
            return res.status(500).json({
                isError: true,
                errorId: 'ServerError',
                errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
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
    console.error('Error has occurred in passport.js');
    return res.status(400).json({
        isError: true,
        errorId: 'ClientError',
        errorMessage: '正常に処理が実行できませんでした。入力値をもう一度お確かめください。'
    });
});

module.exports = router;
