'use strict';

const { check } = require('express-validator');
const { PLAN_TYPE, SCHEDULE_LOGIC_FILENAME } = require('../../../config/const');
const { validationChainWrappers, checkNotEmpty, skipCheckIfUndefined, skipCheckIfFalsy } = require('./validationUtils');

const plansValidators = {
    id: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('id', 'ID'), 'ID', 1),
    ids: validationChainWrappers.checkIntegerArrayWrapper(checkNotEmpty('ids', 'IDs'), 'IDs'),
    title: validationChainWrappers.checkLengthMinMaxWrapper(checkNotEmpty('title', 'タイトル'), 'タイトル', 1, 100),
    context: validationChainWrappers.checkLengthMinMaxWrapper(skipCheckIfUndefined('context'), '説明', 0, 500),
    date: validationChainWrappers.checkDateWithRegexWrapper(
        skipCheckIfUndefined('date'),
        '日付',
        /^\d{4}-\d{2}-\d{2}$/
    ),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(skipCheckIfUndefined('startTime'), '開始時間'),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(skipCheckIfUndefined('endTime'), '終了時間'),
    processTime: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('processTime'), '処理時間', 1),
    travelTime: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('travelTime'), '移動時間', 0),
    bufferTime: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('bufferTime'), '予備時間', 0),
    planType: validationChainWrappers.checkInWrapper(
        checkNotEmpty('planType', '予定種別'),
        '予定種別',
        Object.values(PLAN_TYPE)
    ),
    priority: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('priority'), '優先度', 0),
    place: validationChainWrappers.checkLengthMinMaxWrapper(skipCheckIfUndefined('place'), '場所', 0, 100),
    isRequiredPlan: validationChainWrappers.checkBooleanWrapper(skipCheckIfUndefined('isRequiredPlan'), '必須予定か'),
    parentPlanId: validationChainWrappers.checkIntegerWithMinWrapper(
        skipCheckIfUndefined('parentPlanId'),
        '親予定ID',
        1
    ),
    isParentPlan: validationChainWrappers.checkBooleanWrapper(skipCheckIfUndefined('isParentPlan'), '親予定か'),
    checkWithPlanType: check('planType').custom((planType, { req }) => {
        if (planType === PLAN_TYPE.PLAN) {
            if (req.body.startTime === undefined || req.body.endTime === undefined) {
                throw new Error('開始時間と終了時間は必須です。');
            }
        } else if (planType === PLAN_TYPE.TODO) {
            if (req.body.processTime === undefined) {
                throw new Error('所要時間は必須です。');
            }
        }
        return true;
    })
};

const recurringPlansValidators = {
    setId: ({ isNotEmpty }) =>
        validationChainWrappers.checkIntegerWithMinWrapper(
            isNotEmpty ? checkNotEmpty('setId', 'セットID') : skipCheckIfUndefined('setId'),
            'セットID',
            1
        ),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(
        checkNotEmpty('startTime', '開始時間'),
        '開始時間'
    ),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('endTime', '終了時間'), '終了時間')
};

const userValidators = {
    id: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('id', 'ID'), 'ID', 1),
    nickname: validationChainWrappers.checkLengthMinMaxWrapper(skipCheckIfFalsy('nickname'), 'ニックネーム', 1, 20),
    email: validationChainWrappers.checkEmailWrapper(checkNotEmpty('email', 'メールアドレス')),
    password: (fields) => validationChainWrappers.checkPasswordWrapper(checkNotEmpty(fields, 'パスワード')),
    checkSamePassword: (password1, password2) =>
        validationChainWrappers.checkSameStringWrapper(check(password1), password2, 'パスワード', 'パスワード再入力'),
    checkDifferentPassword: (currentPassword, newPassword) =>
        validationChainWrappers.checkDifferentStringWrapper(
            check(currentPassword),
            newPassword,
            '現在のパスワード',
            '新しいパスワード'
        )
};

const scheduleValidators = {
    date: validationChainWrappers.checkDateWithRegexWrapper(
        checkNotEmpty('date', '日付'),
        '日付',
        /^\d{4}-\d{2}-\d{2}$/
    ),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(
        checkNotEmpty('startTime', '開始時間'),
        '開始時間'
    ),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('endTime', '終了時間'), '終了時間'),
    currentTime: validationChainWrappers.checkTimeString4digitsWrapper(
        checkNotEmpty('currentTime', '現在時刻'),
        '現在時刻'
    )
};

const daySettingsValidators = {
    dayIds: validationChainWrappers.checkIntegerArrayWrapper(checkNotEmpty('dayIds', '曜日ID'), '曜日ID'),
    scheduleStartTime: validationChainWrappers.checkTimeString4digitsWrapper(
        checkNotEmpty('scheduleStartTime', 'スケジュール開始時間'),
        'スケジュール開始時間'
    ),
    scheduleEndTime: validationChainWrappers.checkTimeString4digitsWrapper(
        checkNotEmpty('scheduleEndTime', 'スケジュール終了時間'),
        'スケジュール終了時間'
    ),
    schedulingLogic: validationChainWrappers.checkInWrapper(
        checkNotEmpty('schedulingLogic', 'スケジュールロジック'),
        'スケジュールロジック',
        Object.keys[SCHEDULE_LOGIC_FILENAME]
    )
};

module.exports = {
    plansValidators,
    recurringPlansValidators,
    userValidators,
    daySettingsValidators,
    scheduleValidators
};
