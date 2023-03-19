'use strict';

const { PLAN_TYPE } = require('../../../config/const');
const {
    validationChainWrappers,
    checkNotEmpty,
    skipCheckIfUndefined,
    skipCheckIfNullable
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
    planType: checkNotEmpty('planType').isIn(Object.values(PLAN_TYPE)).withMessage('should be a set value'),
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
    setIdForCreate: validationChainWrappers.checkIntegerWithMinWrapper(skipCheckIfUndefined('setId'), 1),
    setIdForUpdate: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('setId'), 1),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('startTime')),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('endTime'))
};

const todoOrdersValidators = {
    id: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('id'), 1),
    todoOrders: validationChainWrappers.checkIntegerCsvWrapper(checkNotEmpty('todoOrders'))
};

const userValidators = {
    id: validationChainWrappers.checkIntegerWithMinWrapper(checkNotEmpty('id'), 1),
    email: validationChainWrappers.checkEmailWrapper(checkNotEmpty('email')),
    password: validationChainWrappers.checkPasswordWrapper(checkNotEmpty('password'))
};

const scheduleValidators = {
    date: validationChainWrappers.checkDateWithRegexWrapper(checkNotEmpty('date'), /^\d{4}-\d{2}-\d{2}$/),
    startTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('startTime')),
    endTime: validationChainWrappers.checkTimeString4digitsWrapper(checkNotEmpty('endTime'))
};

const daySettingsValidators = {
    dayIds: validationChainWrappers.checkIntegerArrayWrapper(checkNotEmpty('dayIds'))
};

module.exports = {
    plansValidators,
    fixPlansValidators,
    todoOrdersValidators,
    userValidators,
    daySettingsValidators,
    scheduleValidators
};
