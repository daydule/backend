'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const guestCheck = require('../../app/middlewares/guestCheck');

describe('guestCheck.js', function () {
    describe('guestCheck function', function () {
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

            const result = guestCheck({}, res, stub);
            assert.equal(result.isError, true);
            assert.equal(stub.callCount, 0);
        });

        it('should return json of error if is guest.', function () {
            const stub = sinon.stub();
            stub.returns();
            const req = {
                user: {
                    is_guest: true
                }
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

            const result = guestCheck(req, res, stub);
            assert.equal(result.isError, true);
            assert.equal(stub.callCount, 0);
        });

        it('should call next function once if logged in and is not guest.', function () {
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
            guestCheck(req, res, stub);
            assert.equal(stub.callCount, 1);
        });
    });
});
