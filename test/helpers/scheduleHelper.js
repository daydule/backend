'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
// eslint-disable-next-line node/no-unpublished-require
const proxyquire = require('proxyquire');

const scheduleLogic = {
    execute: sinon.stub().callsFake((pool, scheduleLogicId, scheduleId, startTime, endTime, plans, todos) => {
        return 'result';
    })
};

const scheduleHelper = proxyquire('../../app/helpers/scheduleHelper', {
    './schedule/simpleScheduleHelper': scheduleLogic
});

describe('scheduleHelper.js', function () {
    describe('createSchedule function', function () {
        it('should return object with isError flag true when scheduleLogicId is NOT correct.', async function () {
            const expect = {
                isError: false,
                result: 'result'
            };

            const result = await scheduleHelper.createSchedule('', 0, '', '', '', '', '', '');
            assert.deepStrictEqual(result, expect);
        });

        it('should return object with isError flag false when scheduleLogicId is correct.', async function () {
            const expect = {
                isError: true,
                errorId: 'errorId',
                errorMessage: 'システムエラー'
            };

            const result = await scheduleHelper.createSchedule('', 1, '', '', '', '', '', '');
            assert.deepStrictEqual(result, expect);
        });
    });

    describe('transferSnakeCaseToLowerCamelCase function', function () {
        it('should return camel case string transferred from input string.', async function () {
            const input = 'lower_camel_case';
            const expect = 'lowerCamelCase';
            const result = scheduleHelper.transferSnakeCaseToLowerCamelCase(input);
            assert.equal(result, expect);
        });
    });

    describe('transferSnakeCaseObjectToLowerCamelCaseObject function', function () {
        it('should return camel case keys object transferred from input object.', async function () {
            const input = { lower_camel_case: 1, snake_case: 'string' };
            const expect = { lowerCamelCase: 1, snakeCase: 'string' };
            const result = scheduleHelper.transferSnakeCaseObjectToLowerCamelCaseObject(input);
            assert.deepStrictEqual(result, expect);
        });
    });
});
