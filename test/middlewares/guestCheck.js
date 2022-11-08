'use strict';

// eslint-disable-next-line node/no-unpublished-require
const assert = require('chai').assert;
const guestCheck = require('../../middlewares/guestCheck');

describe('guestCheck.js', function () {
    describe('guestCheck function', function () {
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

            const result = guestCheck({}, res, function () {});
            assert.equal(result.isError, true);
        });

        it('should set "isGuest message" to isGuest of request if it is a guest.', function () {
            const req = {
                user: {
                    is_guest: 'isGuest message'
                }
            };

            guestCheck(req, {}, function () {});
            assert.equal(req.isGuest, 'isGuest message');
        });
    });
});
