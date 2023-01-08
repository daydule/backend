'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { promisify } = require('util');
const crypto = require('crypto');
const guestCheck = require('../middlewares/guestCheck');
const constant = require('../config/const');

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

/**
 * パスワード更新
 */
router.post('/password/update', guestCheck, async function (req, res) {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    try {
        // TODO: バリデーションチェック（書式チェック）をする

        // TODO: 以下のバリデーションチェック（パスワードが正しいかどうかのチェック）をヘルパーで実装する
        // バリデーションチェック（パスワードが正しいかどうかのチェック）をする
        const hashedCurrentPassword = await promisify(crypto.pbkdf2)(
            currentPassword,
            req.user.salt,
            310000,
            32,
            'sha256'
        );
        if (hashedCurrentPassword.toString('base64') != req.user.hashed_password) {
            console.error('パスワードが違います。');
            return res.status(400).json({
                isError: true,
                errorId: 'errorId',
                errorMessage: 'パスワードが違います。'
            });
        }

        const hashedNewPassword = await promisify(crypto.pbkdf2)(newPassword, req.user.salt, 310000, 32, 'sha256');
        const sql = 'UPDATE users SET hashed_password = $1 WHERE id = $2 RETURNING *';
        const values = [hashedNewPassword.toString('base64'), req.user.id];
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

/**
 * スケジュール設定参照
 */
router.get('/schedule/settings/read', async function (req, res) {
    const userId = req.user.id;
    const dayListNum = constant.DAY_LIST_NUM;
    const daySettingInfo = [];

    try {
        for (let i = 0; i < dayListNum; i++) {
            const getDaySettingResult = await pool.query('SELECT * FROM day_settings WHERE user_id = $1 AND day = $2', [
                userId,
                i
            ]);

            daySettingInfo.push(getDaySettingResult.rows[0]);
        }

        const result = [];
        for (let i = 0; i < daySettingInfo.length; i++) {
            const getFixPlansResult = await pool.query('SELECT * FROM fix_plans WHERE day_id = $1', [
                daySettingInfo[i].id
            ]);

            result.push({
                dayId: daySettingInfo[i].day,
                daySetting: daySettingInfo[i],
                fixPlans: getFixPlansResult.rows
            });
        }

        return res.status(200).json({
            isError: false,
            settingInfo: result
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
