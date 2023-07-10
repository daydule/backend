'use strict';

const { body } = require('express-validator');

const checkNotEmpty = (fields, name) => body(fields).notEmpty().withMessage(`${name}は必須です。`);

const skipCheckIfUndefined = (fields) => body(fields).optional();
const skipCheckIfNullable = (fields) => body(fields).optional({ nullable: true });
const skipCheckIfFalsy = (fields) => body(fields).optional({ checkFalsy: true });
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
    checkIntegerWrapper: (validationChain, name) =>
        validationChain.isInt().withMessage(`${name}は整数です。システム管理者に問い合わせてください。`),
    checkIntegerWithMinWrapper: (validationChain, name, min) =>
        validationChain
            .isInt({ min })
            .withMessage(`${name}は${min}以上の整数です。システム管理者に問い合わせてください。`),
    checkIntegerArrayWrapper: (validationChain, name) =>
        validationChain
            .isArray()
            .withMessage(`${name}は配列です。システム管理者に問い合わせてください。`)
            .custom((ids) => ids.every((id) => Number.isInteger(Number(id))))
            .withMessage(`${name}は整数の配列です。システム管理者に問い合わせてください。`),
    checkLengthMinMaxWrapper: (validationChain, name, min, max) =>
        validationChain
            .isLength({ min, max })
            .withMessage(`${name}は${min}以上、${max}以下の文字列です。システム管理者に問い合わせてください。`),
    checkDateWrapper: (validationChain, name) =>
        validationChain
            .custom((date) => {
                const dateObject = new Date(date);
                return dateObject instanceof Date && !isNaN(dateObject.valueOf());
            })
            .withMessage(`${name}はDate型に変換可能な文字列です。システム管理者に問い合わせてください。`),
    checkDateWithRegexWrapper: (validationChain, name, regex) =>
        validationChain
            .custom((date) => {
                return regex.test(date);
            })
            .withMessage(`${name}は${regex}のフォーマットです。システム管理者に問い合わせてください。`)
            .custom((date) => {
                const dateObject = new Date(date);
                return dateObject instanceof Date && !isNaN(dateObject.valueOf());
            })
            .withMessage(`${name}はDate型に変換可能な文字列です。システム管理者に問い合わせてください。`),
    checkTimeString4digitsWrapper: (validationChain, name) =>
        validationChain
            .custom((time) => time.length === 4)
            .withMessage(`${name}は４桁の時間を表す数字の文字列です(1)。システム管理者に問い合わせてください。`)
            .custom((time) => time.split('').every((c) => Number.isInteger(parseInt(c, 10))))
            .withMessage(`${name}は４桁の時間を表す数字の文字列です(2)。システム管理者に問い合わせてください。`)
            .custom((time) => {
                const hour = parseInt(time.substring(0, 2), 10);
                const minute = parseInt(time.substring(2), 10);
                return 0 <= hour && hour <= 23 && 0 <= minute && minute <= 59;
            })
            .withMessage(`${name}は４桁の時間を表す数字の文字列です(3)。システム管理者に問い合わせてください。`),
    checkDifferentStringWrapper: (validationChain, string2, name1, name2) =>
        validationChain
            .custom((string1, { req }) => string1 !== req.body[string2])
            .withMessage(`${name1}は${name2}とは違う文字列にしてください。`),
    checkSameStringWrapper: (validationChain, string2, name1, name2) =>
        validationChain
            .custom((string1, { req }) => string1 === req.body[string2])
            .withMessage(`${name1}と${name2}は同じ文字列にしてください。`),
    checkBooleanWrapper: (validationChain, name) =>
        validationChain.isBoolean().withMessage(`${name}はboolean型です。システム管理者に問い合わせてください。`),
    checkInWrapper: (validationChain, name, array) =>
        validationChain
            .isIn(array)
            .withMessage(
                `${name}は「${array?.join('')}」の中のどれかの文字列です。システム管理者に問い合わせてください。`
            ),
    checkEmailWrapper: (validationChain) =>
        validationChain.isEmail().withMessage('メールアドレスとして正しい文字列を入力してください。'),
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
                'パスワードは次の条件に当てはまる文字列にしてください。[8文字以上][大文字,小文字,数字を1文字以上含む]'
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
