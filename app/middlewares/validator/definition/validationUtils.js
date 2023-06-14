'use strict';

const { check } = require('express-validator');

const checkNotEmpty = (fields, name) => check(fields).notEmpty().withMessage(`${name}は必須です。`);

const skipCheckIfUndefined = (fields) => check(fields).optional();
const skipCheckIfNullable = (fields) => check(fields).optional({ nullable: true });
const skipCheckIfFalsy = (fields) => check(fields).optional({ checkFalsy: true });
/**
 * NOTE:
 * optional(defaultOptions) // undefinedの場合はcheckをスキップする
 * type defaultOptions =
 * {
 *   nullable: false,  // nullの場合もcheckをスキップするかどうか
 *   checkFalsy: false // null, false, 0, 空文字などの場合もcheckをスキップするかどうか
 * }
 */

const validationChainWrappers = {
    checkIntegerWrapper: (validationChain, name) => validationChain.isInt().withMessage(`${name}は整数です。`),
    checkIntegerWithMinWrapper: (validationChain, name, min) =>
        validationChain.isInt({ min }).withMessage(`${name}は${min}以上の整数です。`),
    checkIntegerArrayWrapper: (validationChain, name) =>
        validationChain
            .isArray()
            .withMessage(`${name}は配列です。`)
            .custom((ids) => ids.every((id) => Number.isInteger(Number(id))))
            .withMessage(`${name}は整数の配列です。`),
    checkLengthMinMaxWrapper: (validationChain, name, min, max) =>
        validationChain.isLength({ min, max }).withMessage(`${name}は${min}以上、${max}以下の文字列です。`),
    checkDateWrapper: (validationChain, name) =>
        validationChain
            .custom((date) => {
                const dateObject = new Date(date);
                return dateObject instanceof Date && !isNaN(dateObject.valueOf());
            })
            .withMessage(`${name}はDate型に変換可能な文字列です。`),
    checkDateWithRegexWrapper: (validationChain, name, regex) =>
        validationChain
            .custom((date) => {
                return regex.test(date);
            })
            .withMessage(`${name}は${regex}のフォーマットです。`)
            .custom((date) => {
                const dateObject = new Date(date);
                return dateObject instanceof Date && !isNaN(dateObject.valueOf());
            })
            .withMessage(`${name}はDate型に変換可能な文字列です。`),
    checkTimeString4digitsWrapper: (validationChain, name) =>
        validationChain
            .custom((time) => time.length === 4)
            .withMessage(`${name}は４桁の時間を表す数字の文字列です。(1)`)
            .custom((time) => time.split('').every((c) => Number.isInteger(parseInt(c, 10))))
            .withMessage(`${name}は４桁の時間を表す数字の文字列です。(2)`)
            .custom((time) => {
                const hour = parseInt(time.substring(0, 2), 10);
                const minute = parseInt(time.substring(2), 10);
                return 0 <= hour && hour <= 23 && 0 <= minute && minute <= 59;
            })
            .withMessage(`${name}は４桁の時間を表す数字の文字列です。(3)`),
    checkDifferentStringWrapper: (validationChain, string2, name1, name2) =>
        validationChain
            .custom((string1, { req }) => string1 !== req.body[string2])
            .withMessage(`${name1}は${name2}とは違う文字列にしてください。`),
    checkSameStringWrapper: (validationChain, string2, name1, name2) =>
        validationChain
            .custom((string1, { req }) => string1 === req.body[string2])
            .withMessage(`${name1}と${name2}が違います。`),
    checkBooleanWrapper: (validationChain, name) => validationChain.isBoolean().withMessage(`${name}は真偽値です。`),
    checkInWrapper: (validationChain, name, array) =>
        validationChain.isIn(array).withMessage(`${name}は「${array?.join('')}」の中の値です。`),
    checkEmailWrapper: (validationChain) =>
        validationChain.isEmail().withMessage('メールアドレスとして正しくありません。'),
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
                'パスワードは次の条件に当てはまる値にしてください。[8文字以上][大文字,小文字,数字を1文字以上含む]'
            )
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
};

module.exports = {
    checkNotEmpty,
    skipCheckIfUndefined,
    skipCheckIfNullable,
    skipCheckIfFalsy,
    validationChainWrappers
};
