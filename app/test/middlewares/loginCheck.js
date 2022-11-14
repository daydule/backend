'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
const loginCheck = require('../../middlewares/loginCheck');

describe('loginCheck.js', function () {
    describe('loginCheck function', function () {
        it('should return json of error if not logged in.', function () {
            const res = {
                status: function (code) {
                    return {
                        json: function (json) {
                            return json;
                        }
                    };
                }
            };
            const result = loginCheck({}, res, function () {});
            assert.equal(result.isError, true);
        });
    });
});
