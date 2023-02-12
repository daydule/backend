'use strict';

// eslint-disable-next-line node/no-unpublished-require
const chai = require('chai');
const assert = chai.assert;
const should = chai.should();
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const dbOperation = require('../../app/utils/dbOperation');

describe('dbOperation.js', function () {
    describe('bulkInsert function', function () {
        it('should call client.query function once and return result correctly.', async function () {
            const dummyResult = { rows: ['dummy'] };
            const stub = sinon.stub().returns(dummyResult);
            const client = { query: stub };
            const tableName = 'dummyTableName';
            const tableColumns = ['a', 'b', 'c'];
            const values = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const result = await dbOperation.bulkInsert(client, tableName, tableColumns, values);
            assert(stub.callCount, 1);
            assert(result, dummyResult);
        });

        it('should throw error if it is a bat request and NOT exist result.', async function () {
            const dummyError = new Error('dummy error');
            const stub = sinon.stub().throws(dummyError);
            const client = { query: stub };
            const tableName = 'dummyTableName';
            const tableColumns = ['column_a', 'column_b', 'column_c'];
            const values = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            let result;
            try {
                result = await dbOperation.bulkInsert(client, tableName, tableColumns, values);
            } catch (e) {
                assert(e, dummyError);
            } finally {
                should.not.exist(result);
            }
        });
    });
});
