'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const simpleScheduleHelper = require('../../../app/helpers/schedule/simpleScheduleHelper');
const updateFunction = sinon.stub().callsFake(() => {});

describe('simpleScheduleHelper.js', function () {
    const pool = {
        query: function (sql, params) {
            if (sql === 'UPDATE plans SET is_scheduled = $1, is_parent_plan = $2 WHERE id = $3') {
                // 分割TODOがあった時の処理
                updateFunction();
            } else if (
                sql ===
                'UPDATE plans SET start_time = $1, end_time = $2, date = $3, is_scheduled = $4 WHERE id = $5 RETURNING *'
            ) {
                return {
                    rows: [
                        {
                            startTime: params[0]
                        }
                    ]
                };
            } else {
                return {
                    rows: [
                        {
                            title: 'test',
                            processTime: params[6]
                        }
                    ]
                };
            }
        }
    };

    describe('execute function', function () {
        it('should return object with isError flag true when length of todos is 0.', async function () {
            const expect = {
                isError: true,
                errorId: 'errorId',
                errorMessage: 'システムエラー'
            };

            const result = await simpleScheduleHelper.execute('', '', '', '', '', '', '');
            assert.equal(result.isError, true);
        });

        it('should return object with isError flag true when there is an invalid start_time of required plan.', async function () {
            const expect = {
                isError: true,
                errorId: 'errorId',
                errorMessage: 'システムエラー'
            };

            const plans = [
                {
                    startTime: '0800',
                    endTime: '1000'
                }
            ];

            const todos = ['sample'];
            const result = await simpleScheduleHelper.execute('', '', '', '0900', '1800', plans, todos);
            assert.deepEqual(result, expect);
        });

        it('should return object with isError flag true when there is an invalid end_time of required plan.', async function () {
            const expect = {
                isError: true,
                errorId: 'errorId',
                errorMessage: 'システムエラー'
            };

            const plans = [
                {
                    startTime: '0900',
                    endTime: '1900'
                }
            ];

            const todos = ['sample'];
            const result = await simpleScheduleHelper.execute('', '', '', '0900', '1800', plans, todos);
            assert.deepEqual(result, expect);
        });

        it('should register 35m 1st TODO to schedule and NOT register 60m 2nd TODO to schedule.', async function () {
            const plans = [
                {
                    isRequiredPlan: true,
                    title: 'test1',
                    startTime: '0900',
                    endTime: '1000'
                },
                {
                    isRequiredPlan: true,
                    title: 'test2',
                    startTime: '1100',
                    endTime: '1130'
                },
                {
                    isRequiredPlan: false,
                    title: 'test3',
                    startTime: '0930',
                    endTime: '1145'
                }
            ];

            const todos = [
                {
                    title: 'test4',
                    processTime: 35
                },
                {
                    title: 'test5',
                    processTime: 60
                }
            ];

            const result = await simpleScheduleHelper.execute(pool, '', '', '0900', '1200', plans, todos);
            assert.equal(result.isError, false);
            assert.equal(result.schedule.requiredPlans.length, 2);
            assert.equal(result.schedule.requiredPlans[0].title, 'test1');
            assert.equal(result.schedule.requiredPlans[1].title, 'test2');
            assert.equal(result.schedule.requiredPlans.length, 2);
            assert.equal(result.schedule.todos.length, 1);
            assert.equal(result.schedule.todos[0].startTime, '1000');
            assert.equal(result.schedule.optionalPlans.length, 1);
            assert.equal(result.schedule.optionalPlans[0].title, 'test3');
            assert.equal(result.other.todos.length, 1);
            assert.equal(result.other.todos[0].title, 'test5');
        });

        it('should register 60m 1st TODO and 30m 3rd TODO to schedule and NOT register 35m 2nd TODO to schedule.', async function () {
            const plans = [
                {
                    isRequiredPlan: true,
                    title: 'test1',
                    startTime: '0900',
                    endTime: '1000'
                },
                {
                    isRequiredPlan: true,
                    title: 'test2',
                    startTime: '1100',
                    endTime: '1130'
                },
                {
                    isRequiredPlan: false,
                    title: 'test3',
                    startTime: '0930',
                    endTime: '1145'
                }
            ];

            const todos = [
                {
                    title: 'test4',
                    processTime: 60
                },
                {
                    title: 'test5',
                    processTime: 35
                },
                {
                    title: 'test6',
                    processTime: 30
                }
            ];

            const result = await simpleScheduleHelper.execute(pool, '', '', '0900', '1200', plans, todos);
            assert.equal(result.schedule.todos.length, 2);
            assert.equal(result.schedule.todos[0].startTime, '1000');
            assert.equal(result.schedule.todos[1].startTime, '1130');
            assert.equal(result.other.todos.length, 1);
            assert.equal(result.other.todos[0].title, 'test5');
        });

        it('should register 90m TODO to schedule by dividing.', async function () {
            const plans = [
                {
                    isRequiredPlan: true,
                    title: 'test1',
                    startTime: '0900',
                    endTime: '1000'
                },
                {
                    isRequiredPlan: true,
                    title: 'test2',
                    startTime: '1100',
                    endTime: '1130'
                },
                {
                    isRequiredPlan: false,
                    title: 'test3',
                    startTime: '0930',
                    endTime: '1145'
                }
            ];

            const todos = [
                {
                    title: 'test4',
                    processTime: 90
                }
            ];

            const result = await simpleScheduleHelper.execute(pool, '', '', '0900', '1200', plans, todos);
            assert.equal(result.schedule.todos.length, 2);
            assert.equal(result.schedule.todos[0].title, 'test');
            assert.equal(result.schedule.todos[1].title, 'test');
            assert.equal(result.schedule.todos[0].processTime, 60);
            assert.equal(result.schedule.todos[1].processTime, 30);
            assert.equal(result.other.todos.length, 0);
            assert.equal(updateFunction.callCount, 1);
        });
    });
});
