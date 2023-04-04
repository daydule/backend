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
                errorId: 'serverError',
                errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
            };

            const result = await scheduleHelper.createSchedule('', 1, '', '', '', '', '', '');
            assert.deepStrictEqual(result, expect);
        });
    });
});
