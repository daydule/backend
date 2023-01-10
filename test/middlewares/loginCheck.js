'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const loginCheck = require('../../middlewares/loginCheck');

describe('loginCheck.js', function () {
    describe('loginCheck function', function () {
        it('should return json of error if not logged in.', function () {
            const stub = sinon.stub();
            stub.returns();
            const res = {
                status: function (code) {
                    return {
                        json: function (json) {
                            return json;
                        }
                    };
                }
            };
            const result = loginCheck({}, res, stub);
            assert.equal(result.isError, true);
            assert.equal(stub.callCount, 0);
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
            const stub = sinon.stub();
            stub.returns();
            loginCheck(req, res, stub);
            assert.equal(stub.callCount, 1);
        });
    });
});
