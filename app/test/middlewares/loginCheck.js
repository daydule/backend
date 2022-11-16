'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const loginCheck = require('../../middlewares/loginCheck');

describe('loginCheck.js', function () {
    describe('loginCheck function', function () {
        it('should return json of error if not logged in.', function () {
            const next = sinon.stub().callsFake(function () {});
            const res = {
                status: function (code) {
                    return {
                        json: function (json) {
                            return json;
                        }
                    };
                }
            };
            const result = loginCheck({}, res, next);
            assert.equal(result.isError, true);
            assert.equal(next.callCount, 0);
        });

        it('should call next function once if logged in.', function () {
            const req = {
                user: {}
            };
            const res = {
                status: function (code) {
                    return {
                        json: function (json) {
                            return json;
                        }
                    };
                }
            };
            const next = sinon.stub().callsFake(function () {});
            loginCheck(req, res, next);
            assert.equal(next.callCount, 1);
        });
    });
});
