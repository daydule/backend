'use strict';

// eslint-disable-next-line node/no-unpublished-require
const { assert, expect } = require('chai');
// eslint-disable-next-line node/no-unpublished-require
const sinon = require('sinon');
const { validationResult } = require('express-validator');
const { plansValidators, errorMessageFormatter } = require('../../../app/middlewares/validation/generalValidators');

describe('generalValidators.js', function () {
    describe('plansValidators.title function', function () {
        it('should return error if request includes invalid body.', async function () {
            const expectedError = [
                '(title : undefined) not empty',
                '(title : undefined) should be between 1 and 100 characters.'
            ];
            const next = () => {
                const result = validationResult(req);
                expect(expectedError).to.eql(errorMessageFormatter(result.errors));
            };
            const req = {
                body: {}
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
            const result = await plansValidators.title(req, res, next);
        });
    });
});
