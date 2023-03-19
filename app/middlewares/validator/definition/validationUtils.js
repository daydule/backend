'use strict';

const { check } = require('express-validator');

const checkNotEmpty = (fields) => check(fields).notEmpty().withMessage('not empty');

const skipCheckIfUndefined = (fields) => check(fields).optional();
const skipCheckIfNullable = (fields) => check(fields).optional({ nullable: true });
const skipCheckIfFalsy = (fields) => check(fields).optional({ checkFalsy: true });
/**
 * optional(defaultOptions) // undefinedの場合はcheckをスキップする
 * type defaultOptions =
 * {
 *   nullable: false,  // nullの場合もcheckをスキップするかどうか
 *   checkFalsy: false // null, false, 0, 空文字などの場合もcheckをスキップするかどうか
 * }
 */

const validationChainWrappers = {
    checkIntegerWrapper: (validationChain) => validationChain.isInt().withMessage('should be an integer'),
    checkIntegerWithMinWrapper: (validationChain, min) =>
        validationChain.isInt({ min }).withMessage('should be an integer over ' + min),
    checkIntegerArrayWrapper: (validationChain) =>
        validationChain
            .isArray()
            .withMessage('should be an array')
            .custom((ids) => ids.every((id) => Number.isInteger(Number(id))))
            .withMessage('should contain only integers'),
    checkLengthMinMaxWrapper: (validationChain, min, max) =>
        validationChain.isLength({ min, max }).withMessage('should be between ' + min + ' and ' + max + ' characters.'),
    checkDateWrapper: (validationChain) =>
        validationChain
            .custom((date) => {
                const dateObject = new Date(date);
                return dateObject instanceof Date && !isNaN(dateObject.valueOf());
            })
            .withMessage('should be a string of being able to be converted to a Date type'),
    checkDateWithRegexWrapper: (validationChain, regex) =>
        validationChain
            .custom((date) => {
                return regex.test(date);
            })
            .withMessage('should be a string of "YYYY-MM-DD" format')
            .custom((date) => {
                const dateObject = new Date(date);
                return dateObject instanceof Date && !isNaN(dateObject.valueOf());
            })
            .withMessage('should be a string of being able to be converted to a Date type'),
    checkTimeString4digitsWrapper: (validationChain) =>
        validationChain
            .custom((time) => time.length === 4)
            .withMessage('should be a string of "HHMM" format (1)')
            .custom((time) => time.split('').every((c) => Number.isInteger(parseInt(c, 10))))
            .withMessage('should be a string of "HHMM" format (2)')
            .custom((time) => {
                const hour = parseInt(time.substring(0, 2), 10);
                const minute = parseInt(time.substring(2), 10);
                return 0 <= hour && hour <= 23 && 0 <= minute && minute <= 59;
            })
            .withMessage('should be a string of "HHMM" format (3)'),
    checkBooleanWrapper: (validationChain) => validationChain.isBoolean().withMessage('should be a boolean'),
    checkEmailWrapper: (validationChain) => validationChain.isEmail().withMessage('should be in email address format'),
    checkPasswordWrapper: (validationChain) =>
        validationChain
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
            ),
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

    checkIntegerCsvWrapper: (validationChain) =>
        validationChain
            .custom((csv) => csv.split(',').every((value) => Number.isInteger(parseInt(value, 10))))
            .withMessage('should be in the form of a numerical csv')
};

module.exports = {
    checkNotEmpty,
    skipCheckIfUndefined,
    skipCheckIfNullable,
    skipCheckIfFalsy,
    validationChainWrappers
};
