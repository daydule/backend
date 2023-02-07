'use strict';

const { check } = require('express-validator/check');
const { PLAN_TYPE } = require('../config/const');

const plansValidationCheck = {
    id: check('id').notEmpty().withMessage('not empty').isInt().withMessage('should be an integer'),
    title: check('title')
        .notEmpty()
        .withMessage('not empty')
        .isLength({ min: 1, max: 100 })
        .withMessage('should be between 1 and 100 characters.'),
    context: check('context').optional({ checkFalsy: true, nullable: true }),
    date: check('date').optional({ checkFalsy: true, nullable: true }).isISO8601().withMessage('incorrect date format'),
    startTime: check('startTime')
        .optional({ checkFalsy: true, nullable: true })
        .isLength({ min: 4, max: 4 })
        .withMessage('should be a string of four digits'),
    endTime: check('endTime')
        .optional({ checkFalsy: true, nullable: true })
        .isLength({ min: 4, max: 4 })
        .withMessage('should be a string of four digits'),
    processTime: check('processTime')
        .optional({ nullable: true })
        .isInt({ min: 0 })
        .withMessage('should be greater than 0'),
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
    isRequiredPlan: check('isRequiredPlan').optional({ nullable: true }).isBoolean().withMessage('incorrect format'),
    todoStartTime: check('todoStartTime')
        .optional({ checkFalsy: true, nullable: true })
        .isISO8601()
        .withMessage('incorrect time format')
};

const todoOrdersValidationCheck = {
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

const errorMessageFormatter = function (errors) {
    return errors.map((error) => {
        return '(' + error.param + ' : ' + error.value + ') ' + error.msg;
    });
};

module.exports = {
    plansValidationCheck,
    todoOrdersValidationCheck,
    errorMessageFormatter
};
