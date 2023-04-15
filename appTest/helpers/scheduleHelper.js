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
    describe('initScheduleIfFirstCallToday function', function () {
        it('should call pool.query function once if exists schedule record.', async function () {
            const stub = sinon.stub().returns({ rows: ['dummy'] });
            const client = { query: stub };
            const isGuest = false;
            const userId = 'dummyUserId';
            const date = new Date();
            await scheduleHelper.initScheduleIfFirstCallToday(client, isGuest, userId, date);
            assert.equal(stub.callCount, 1);
        });
        it('should call pool.query function twice if does not exist schedule record and is guest.', async function () {
            const stub = sinon.stub().returns({ rows: [] });
            const client = { query: stub };
            const isGuest = true;
            const userId = 'dummyUserId';
            const date = new Date();
            await scheduleHelper.initScheduleIfFirstCallToday(client, isGuest, userId, date);
            assert.equal(stub.callCount, 2);
        });
        it('should call pool.query function 6 times if does not exist schedule record and is not guest.', async function () {
            const stub = sinon.stub();
            stub.callsFake(async (sql, values) => {
                if (sql === 'SELECT * FROM recurring_plans WHERE day_id = $1') {
                    return {
                        rows: [
                            {
                                title: 'title1',
                                context: 'context1',
                                start_time: '0900',
                                end_time: '1800',
                                travel_time: 0,
                                buffer_time: 0,
                                priority: 0,
                                place: 'place1'
                            },
                            {
                                title: 'title2',
                                context: 'context2',
                                start_time: '0900',
                                end_time: '1800',
                                travel_time: 0,
                                buffer_time: 0,
                                priority: 0,
                                place: 'place2'
                            }
                        ]
                    };
                } else if (sql === 'SELECT * FROM day_settings WHERE user_id = $1 AND day = $2') {
                    return { rows: [{ start_time: '0900', end_time: '1800' }] };
                } else {
                    return { rows: [] };
                }
            });
            const client = { query: stub };
            const isGuest = false;
            const userId = 'dummyUserId';
            const date = new Date();
            await scheduleHelper.initScheduleIfFirstCallToday(client, isGuest, userId, date);
            assert.equal(stub.callCount, 6);
        });
    });
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
                errorId: 'ServerError',
                errorMessage: '予期せぬエラーが発生しました。時間を置いて、もう一度お試しください。'
            };

            const result = await scheduleHelper.createSchedule('', 1, '', '', '', '', '', '');
            assert.deepStrictEqual(result, expect);
        });
    });
});
