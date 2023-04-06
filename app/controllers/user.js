'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { promisify } = require('util');
const crypto = require('crypto');
const guestCheck = require('../middlewares/guestCheck');
const dbHelper = require('../helpers/dbHelper');
const { DAY_LIST } = require('../config/const');
const {
    updateUserValidators,
    updateUserPasswordValidators,
    updateScheduleSettingsValidators
} = require('../middlewares/validator/userControllerValidators');

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
router.post('/update', [guestCheck].concat(updateUserValidators), async function (req, res) {
    const nickname = req.body.nickname;
    const email = req.body.email;
    const password = req.body.password;

    const client = await pool.connect();
    try {
        // TODO: バリデーションチェック（書式チェック）をする

        // TODO: 以下のバリデーションチェック（パスワードが正しいかどうかのチェック）をヘルパーで実装する
        // バリデーションチェック（パスワードが正しいかどうかのチェック）をする
        const hashedPassword = await promisify(crypto.pbkdf2)(password, req.user.salt, 310000, 32, 'sha256');
        if (hashedPassword.toString('base64') != req.user.hashed_password) {
            console.error('Password is different from registered password.');
            return res.status(400).json({
                isError: true,
                errorId: 'ClientError',
                errorMessage: '正常に処理が実行できませんでした。入力値をもう一度お確かめください。'
            });
        }

        await client.query('BEGIN');
        const sql = 'UPDATE users SET nickname = $1, email = $2 WHERE id = $3 RETURNING *';
        const values = [nickname, email, req.user.id];
        const result = await dbHelper.query(client, sql, values);
        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            user: {
                nickname: result.rows[0].nickname,
                email: result.rows[0].email
            }
        });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * パスワード更新
 */
router.post('/password/update', [guestCheck].concat(updateUserPasswordValidators), async function (req, res) {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const client = await pool.connect();
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
            console.error('Password is different from registered password.');
            return res.status(400).json({
                isError: true,
                errorId: 'ClientError',
                errorMessage: '正常に処理が実行できませんでした。入力値をもう一度お確かめください。'
            });
        }

        await client.query('BEGIN');

        const hashedNewPassword = await promisify(crypto.pbkdf2)(newPassword, req.user.salt, 310000, 32, 'sha256');
        const sql = 'UPDATE users SET hashed_password = $1 WHERE id = $2 RETURNING *';
        const values = [hashedNewPassword.toString('base64'), req.user.id];
        const result = await dbHelper.query(client, sql, values);
        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            user: {
                nickname: result.rows[0].nickname,
                email: result.rows[0].email
            }
        });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * スケジュール設定参照
 */
router.get('/schedule/settings/read', guestCheck, async function (req, res) {
    const userId = req.user.id;
    const dayListNum = DAY_LIST.length;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const daySettingInfo = [];
        for (let i = 0; i < dayListNum; i++) {
            const getDaySettingResult = await dbHelper.query(
                client,
                'SELECT * FROM day_settings WHERE user_id = $1 AND day = $2',
                [userId, i]
            );

            daySettingInfo.push(getDaySettingResult.rows[0]);
        }

        const result = [];
        for (let i = 0; i < daySettingInfo.length; i++) {
            const getRecurringPlansResult = await dbHelper.query(
                client,
                'SELECT * FROM recurring_plans WHERE day_id = $1',
                [daySettingInfo[i].id]
            );

            result.push({
                dayId: daySettingInfo[i].day,
                daySetting: daySettingInfo[i],
                recurringPlans: getRecurringPlansResult.rows
            });
        }
        await client.query('COMMIT');
        return res.status(200).json({
            isError: false,
            settingInfo: result
        });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({
            isError: true,
            errorId: 'ServerError',
            errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
        });
    } finally {
        client.release();
    }
});

/**
 * 曜日別設定更新
 */
router.post(
    '/schedule/settings/update',
    [guestCheck].concat(updateScheduleSettingsValidators),
    async function (req, res) {
        const id = req.body.id;
        const scheduleStartTime = req.body.scheduleStartTime;
        const scheduleEndTime = req.body.scheduleEndTime;
        const schedulingLogic = req.body.schedulingLogic;

        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            const selectResult = await dbHelper.query(client, 'SELECT * FROM day_settings WHERE id = $1', [id]);
            if (selectResult.rows.length === 0) {
                throw new Error('There is not the record that has this id. id(' + id + ')');
            }

            const sql =
                'UPDATE day_settings \
                SET schedule_start_time = $1, schedule_end_time = $2, scheduling_logic = $3 \
                WHERE id = $4 RETURNING *';
            const values = [scheduleStartTime, scheduleEndTime, schedulingLogic, id];
            const result = await dbHelper.query(client, sql, values);
            await client.query('COMMIT');
            return res.status(200).json({
                isError: false,
                daySettings: result.rows
            });
        } catch (e) {
            await client.query('ROLLBACK');
            console.error(e);
            return res.status(500).json({
                isError: true,
                errorId: 'ServerError',
                errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
            });
        } finally {
            client.release();
        }
    }
);

module.exports = router;
