'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
const { Pool } = require('pg');
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const daySettingsHelper = require('../../app/helpers/daySettingsHelper');

describe('daySettingsHelper.js', function () {
    describe('initDaySettings function', function () {
        it('should call pool.query function 7 times.', async function () {
            const stub = sinon.stub().returns({ rows: ['dummy'] });
            const client = { query: stub };
            await daySettingsHelper.initDaySettings(client, 'dummyUserId');
            assert.equal(stub.callCount, 10);
        });
    });
});
