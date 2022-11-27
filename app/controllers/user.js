'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { promisify } = require('util');
const crypto = require('crypto');
const guestCheck = require('../middlewares/guestCheck');

/**
 * ユーザー情報参照
 */
router.get('/read', function (req, res) {
    return res.status(200).json({
        isError: false,
        user: {
            nickname: req.user.nickname,
            email: req.user.email,
            isGuest: req.user.is_guest
        }
    });
});

/**
 * ユーザー情報更新
 */
router.post('/update', guestCheck, async function (req, res) {
    const nickname = req.body.nickname;
    const email = req.body.email;
    const password = req.body.password;

    try {
        // TODO: バリデーションチェック（書式チェック）をする

        // TODO: 以下のバリデーションチェック（パスワードが正しいかどうかのチェック）をヘルパーで実装する
        // バリデーションチェック（パスワードが正しいかどうかのチェック）をする
        const hashedPassword = await promisify(crypto.pbkdf2)(password, req.user.salt, 310000, 32, 'sha256');
        if (hashedPassword.toString('base64') != req.user.hashed_password) {
            console.error('パスワードが違います。');
            return res.status(400).json({
                isError: true,
                errorId: 'errorId',
                errorMessage: 'パスワードが違います。'
            });
        }

        const sql = 'UPDATE users SET nickname = $1, email = $2 WHERE id = $3 RETURNING *';
        const values = [nickname, email, req.user.id];
        const result = await pool.query(sql, values);
        return res.status(200).json({
            isError: false,
            user: {
                nickname: result.rows[0].nickname,
                email: result.rows[0].email
            }
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'errorId',
            errorMessage: 'サーバーエラー'
        });
    }
});

module.exports = router;
