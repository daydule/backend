'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
// eslint-disable-next-line node/no-unpublished-require
const timeUtil = require('../../app/utils/time');

describe('time.js', function () {
    describe('compareTimeStr function', function () {
        it('should return -1 when arg1 is faster than arg2.', function () {
            const result = timeUtil.compareTimeStr('0900', '1000');
            assert.equal(result, -1);
        });

        it('should return 0 when arg1 and arg2 is equal.', function () {
            const result = timeUtil.compareTimeStr('0900', '0900');
            assert.equal(result, 0);
        });

        it('should return 1 when arg2 is faster than arg1.', function () {
            const result = timeUtil.compareTimeStr('1000', '0900');
            assert.equal(result, 1);
        });
    });

    describe('subtractTimeStr function', function () {
        it('should return subtraction result of arg1 and arg2.', function () {
            const result = timeUtil.subtractTimeStr('1030', '0900');
            assert.equal(result, 90);
        });
    });

    describe('getStartAndEndTimeStr function', function () {
        it('should return subtraction result of arg1 and arg2.', function () {
            const result = timeUtil.getStartAndEndTimeStr('0900', 60, 60);
            assert.equal(result.startTime, '1000');
            assert.equal(result.endTime, '1100');
        });
    });

    describe('convertToYYYY_MM_DD function', function () {
        // Test case 1: Convert a date to YYYY-MM-DD format
        it('Converts date', function () {
            const date = new Date('2022-01-01');
            const result = timeUtil.convertToYYYY_MM_DD(date);
            assert.strictEqual(result, '2022-01-01');
        });

        // Test case 2: Convert a date with single-digit month and day to YYYY-MM-DD format
        it('Converts date with single-digit month and day to YYYY-MM-DD format', function () {
            const date = new Date('2022-02-03');
            const result = timeUtil.convertToYYYY_MM_DD(date);
            assert.strictEqual(result, '2022-02-03');
        });

        // Test case 3: Convert a date with double-digit month and day to YYYY-MM-DD format
        it('Converts date with double-digit month and day to YYYY-MM-DD format', function () {
            const date = new Date('2022-12-31');
            const result = timeUtil.convertToYYYY_MM_DD(date);
            assert.strictEqual(result, '2022-12-31');
        });
    });
});
