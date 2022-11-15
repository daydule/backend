'use strict';

const express = require('express');
const router = express.Router();
const { promisify } = require('util');
const crypto = require('crypto');
const pool = require('../db/pool');
const guestCheck = require('../middlewares/guestCheck');

// TODO: ログインチェックにする
router.use(guestCheck);

/**
 * ユーザー情報参照
 */
router.get('/read', function (req, res) {
    return res.status(200).json({
        isError: false,
        user: {
            userName: req.user.user_name,
            email: req.user.email,
            isGuest: req.user.is_guest
        }
    });
});

/**
 * ユーザー情報更新
 */
router.post('/update', async function (req, res) {
    const userName = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    const salt = crypto.randomBytes(16).toString('base64');

    try {
        // TODO: バリデーションチェックする

        const hashedPassword = await promisify(crypto.pbkdf2)(password, salt, 310000, 32, 'sha256');
        const result = await pool.query(
            'UPDATE users SET user_name = $1, email = $2, password = $3, salt = $4 WHERE id = $5 RETURNING *',
            [userName, email, hashedPassword.toString('base64'), salt, req.user.id]
        );
        return res.status(200).json({
            isError: false,
            user: {
                userName: result.rows[0].user_name,
                email: result.rows[0].email,
                isGuest: result.rows[0].is_guest
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
