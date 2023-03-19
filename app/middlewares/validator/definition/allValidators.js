'use strict';

const { PLAN_TYPE, SCHEDULE_LOGIC_FILENAME } = require('../../../config/const');
const {
    validationChainWrappers,
    checkNotEmpty,
    skipCheckIfUndefined,
    skipCheckIfNullable,
    skipCheckIfFalsy
} = require('./validationUtils');

const plansValidators = {
    id: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('id'), 1),
    ids: validationChainWrappers.checkIntegerArrayWrapper(checkNotEmpty('ids')),
    title: validationChainWrappers.checkLengthMinMaxWrapper(checkNotEmpty('title'), 1, 100),
    context: validationChainWrappers.checkLengthMinMaxWrapper(skipCheckIfNullable('context'), 0, 500),
    date: validationChainWrappers.checkDateWithRegexWrapper(skipCheckIfUndefined('date'), /^\d{4}-\d{2}-\d{2}$/),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(skipCheckIfUndefined('startTime')),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(skipCheckIfUndefined('endTime')),
    processTime: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('processTime'), 1),
    travelTime: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('travelTime'), 0),
    bufferTime: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('bufferTime'), 0),
    planType: validationChainWrappers.checkInWrapper(checkNotEmpty('planType'), Object.values(PLAN_TYPE)),
    priority: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('priority'), 1),
    place: validationChainWrappers.checkLengthMinMaxWrapper(skipCheckIfUndefined('place'), 1, 100),
    isRequiredPlan: validationChainWrappers.checkBooleanWrapper(skipCheckIfUndefined('isRequiredPlan')),
    parentPlanId: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('parentPlanId'), 1),
    isParentPlan: validationChainWrappers.checkBooleanWrapper(skipCheckIfUndefined('isParentPlan')),
    todoStartTime: validationChainWrappers.checkDateWrapper(skipCheckIfUndefined('todoStartTime')),
    checkWithPlanType: checkNotEmpty('planType').custom((planType, { req }) => {
        if (planType === PLAN_TYPE.PLAN || planType === planType.FIX_PLAN) {
            if (req.body.startTime === undefined || req.body.endTime === undefined) {
                throw new Error('should contain startTime and endTime');
            }
        } else if (planType === PLAN_TYPE.TODO) {
            if (req.body.processTime === undefined) {
                throw new Error('should contain processTime');
            }
        }
        return true;
    })
};

const fixPlansValidators = {
    setId: ({ isNotEmpty }) =>
        validationChainWrappers.checkIntegerWithMinWrapper(
            isNotEmpty ? checkNotEmpty('setId') : skipCheckIfUndefined('setId'),
            1
        ),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('startTime')),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('endTime'))
};

const todoOrdersValidators = {
    id: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('id'), 1),
    todoOrders: validationChainWrappers.checkIntegerCsvWrapper(checkNotEmpty('todoOrders'))
};

const userValidators = {
    id: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('id'), 1),
    nickname: validationChainWrappers.checkLengthMinMaxWrapper(skipCheckIfFalsy('nickname'), 1, 20),
    email: validationChainWrappers.checkEmailWrapper(checkNotEmpty('email')),
    password: (fields) => validationChainWrappers.checkPasswordWrapper(checkNotEmpty(fields))
};

const scheduleValidators = {
    date: validationChainWrappers.checkDateWithRegexWrapper(checkNotEmpty('date'), /^\d{4}-\d{2}-\d{2}$/),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('startTime')),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('endTime'))
};

const daySettingsValidators = {
    dayIds: validationChainWrappers.checkIntegerArrayWrapper(checkNotEmpty('dayIds')),
    scheduleStartTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('scheduleStartTime')),
    scheduleEndTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('scheduleEndTime')),
    schedulingLogic: validationChainWrappers.checkInWrapper(
        checkNotEmpty('schedulingLogic'),
        Object.keys[SCHEDULE_LOGIC_FILENAME]
    )
};

module.exports = {
    plansValidators,
    fixPlansValidators,
    todoOrdersValidators,
    userValidators,
    daySettingsValidators,
    scheduleValidators
};
