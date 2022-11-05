'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { promisify } = require('util');
const crypto = require('crypto');
const pool = require('../db/pool');

/**
 * サインアップ
 */
router.post('/signup', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const salt = crypto.randomBytes(16).toString('base64');

    try {
        // TODO バリデーションチェックを行う

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            throw new Error('そのメールアドレスは既に使用されています。');
        }

        if (req.user && req.user.is_guest) {
            // ゲストのサインアップ処理
            const hashedPassword = await promisify(crypto.pbkdf2)(password, salt, 310000, 32, 'sha256');
            await pool.query(
                'UPDATE users SET user_name = $1, email = $2, password = $3, salt = $4, is_guest = $5 WHERE id = $6',
                [username, email, hashedPassword.toString('base64'), salt, false, req.user.id]
            );
        } else {
            // ゲスト以外のサインアップ処理
            const hashedPassword = await promisify(crypto.pbkdf2)(password, salt, 310000, 32, 'sha256');
            await pool.query(
                'INSERT INTO users (user_name, email, password, salt, is_guest) VALUES ($1, $2, $3, $4, $5)',
                [username, email, hashedPassword.toString('base64'), salt, false]
            );
        }

        // TODO 曜日別設定を行う

        res.json({
            isError: false
        });
    } catch (e) {
        console.error(e);
        res.json({
            isError: true,
            errorCode: 'errorCode',
            errorMessage: 'サインアップエラー'
        });
    }
});

/**
 * ログイン
 */
router.post('/login', passport.authenticate('local', { failureRedirect: '/authError' }), (req, res) => {
    res.json({
        isError: false
    });
});

/**
 * 認証エラー時のレスポンスを返却する
 */
router.get('/authError', (req, res) => {
    res.json({
        isError: true,
        errorCode: 'errorCode',
        errorMessage: '認証エラー'
    });
});

module.exports = router;
