'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const dbHelper = require('../../app/helpers/dbHelper');

describe('dbHelper.js', function () {
    describe('transferSnakeCaseToLowerCamelCase function', function () {
        it('should return camel case string transferred from input string.', async function () {
            const input = 'lower_camel_case';
            const expect = 'lowerCamelCase';
            const result = dbHelper.transferSnakeCaseToLowerCamelCase(input);
            assert.equal(result, expect);
        });
    });

    describe('transferSnakeCaseObjectToLowerCamelCaseObject function', function () {
        it('should return camel case keys object transferred from input object.', async function () {
            const input = { lower_camel_case: 1, snake_case: 'string' };
            const expect = { lowerCamelCase: 1, snakeCase: 'string' };
            const result = dbHelper.transferSnakeCaseObjectToLowerCamelCaseObject(input);
            assert.deepStrictEqual(result, expect);
        });
    });

    describe('query function', function () {
        it('should return DB operation result after converting SnakeCase to CamelCase.', async function () {
            const stub = sinon.stub().returns({
                rows: [
                    {
                        sample_a: 'sampleA',
                        sample_b: 'sampleB'
                    },
                    {
                        sample_c: 'sampleC',
                        sample_d: 'sampleD'
                    }
                ]
            });
            const client = {
                query: stub
            };
            const expect = [
                {
                    sampleA: 'sampleA',
                    sampleB: 'sampleB'
                },
                {
                    sampleC: 'sampleC',
                    sampleD: 'sampleD'
                }
            ];
            const result = await dbHelper.query(client, '', []);
            console.log(result.rows);
            assert.deepStrictEqual(result.rows, expect);
        });
    });
});
