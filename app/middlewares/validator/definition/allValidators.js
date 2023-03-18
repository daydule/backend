'use strict';

const { check } = require('express-validator');
const { PLAN_TYPE } = require('../../../config/const');

const plansValidators = {
    id: check('id').notEmpty().withMessage('not empty').isInt().withMessage('should be an integer'),
    title: check('title')
        .notEmpty()
        .withMessage('not empty')
        .isLength({ min: 1, max: 100 })
        .withMessage('should be between 1 and 100 characters.'),
    context: check('context').optional({ checkFalsy: true, nullable: true }),
    date: check('date').optional({ checkFalsy: true, nullable: true }).isISO8601().withMessage('incorrect date format'),
    startTime: check('startTime').custom((startTime, { req }) => {
        if (!startTime) {
            if (req.body.planType === PLAN_TYPE.PLAN || req.body.planType === PLAN_TYPE.FIX_PLAN) {
                throw new Error('not empty');
            }
        } else if (startTime.length !== 4) {
            throw new Error('should be a string of four digits');
        }
        return true;
    }),
    endTime: check('endTime').custom((endTime, { req }) => {
        if (!endTime) {
            if (req.body.planType === PLAN_TYPE.PLAN || req.body.planType === PLAN_TYPE.FIX_PLAN) {
                throw new Error('not empty');
            }
        } else if (endTime.length !== 4) {
            throw new Error('should be a string of four digits');
        }
        return true;
    }),
    processTime: check('processTime').custom((processTime, { req }) => {
        if (!processTime) {
            if (req.body.planType === PLAN_TYPE.TODO) {
                throw new Error('not empty');
            }
        } else if (!Number.isInteger(Number(processTime)) || Number(processTime) < 0) {
            throw new Error('should be integer and greater than 0');
        }
        return true;
    }),
    travelTime: check('travelTime')
        .optional({ nullable: true })
        .isInt({ min: 0 })
        .withMessage('should be greater than 0'),
    bufferTime: check('bufferTime')
        .optional({ nullable: true })
        .isInt({ min: 0 })
        .withMessage('should be greater than 0'),
    planType: check('planType')
        .notEmpty()
        .withMessage('not empty')
        .isIn(Object.values(PLAN_TYPE))
        .withMessage('incorrect plan type number'),
    priority: check('priority')
        .optional({ checkFalsy: true, nullable: true })
        .isInt()
        .withMessage('should be an integer'),
    place: check('place')
        .optional({ checkFalsy: true, nullable: true })
        .isLength({ min: 1, max: 100 })
        .withMessage('should be between 1 and 100 characters.'),
    isRequiredPlan: check('isRequiredPlan')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage('should be an boolean'),
    parentPlanId: check('parentPlanId').optional({ nullable: true }).isInt().withMessage('should be an integer'),
    isParentPlan: check('isParentPlan').optional({ nullable: true }).isBoolean().withMessage('should be an boolean'),
    todoStartTime: check('todoStartTime')
        .optional({ checkFalsy: true, nullable: true })
        .isISO8601()
        .withMessage('incorrect time format')
};

const todoOrdersValidators = {
    id: check('id').notEmpty().withMessage('not empty').isInt().withMessage('should be an integer'),
    todoOrders: check('todoOrders')
        .notEmpty()
        .withMessage('not empty')
        .custom(function (todoOrders) {
            const idList = todoOrders.split(',');
            if (idList.length === 0) throw new Error();
            for (let i = 0; i < idList.length; i++) {
                if (isNaN(Number(idList[i]))) throw new Error();
            }
            return true;
        })
        .withMessage('incorrect format')
};

const userValidators = {
    id: check('id').notEmpty().withMessage('not empty').isInt().withMessage('should be an integer'),
    email: check('email')
        .notEmpty()
        .withMessage('not empty')
        .isEmail()
        .withMessage('should be in email address format'),
    password: check('password')
        .notEmpty()
        .withMessage('not empty')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
            returnScore: false
        })
        .withMessage(
            'should use a string that contains at least 8 characters, including lowercase letters, uppercase letters, and numbers'
        )
};

/**
 * isStrongPassword(defaultOptions)
 * defaultOptions =
 * {
 *    minLength: 8,       // 8文字以上
 *    minLowercase: 1,    // 小文字1文字以上
 *    minUppercase: 1,    // 大文字1文字以上
 *    minNumbers: 1,      // 数字1文字以上
 *    minSymbols: 1,      // 記号1文字以上
 *    returnScore: false, // パスワードの評価を返さない
 *    pointsPerUnique: 1, // 以下はパスワードの評価をする際のポイント割合のオプション
 *    pointsPerRepeat: 0.5,
 *    pointsForContainingLower: 10,
 *    pointsForContainingUpper: 10,
 *    pointsForContainingNumber: 10,
 *    pointsForContainingSymbol: 10
 * }
 */

module.exports = {
    plansValidators,
    todoOrdersValidators,
    userValidators
};
