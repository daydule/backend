'use strict';

// eslint-disable-next-line node/no-unpublished-require
const { expect } = require('chai');
// eslint-disable-next-line node/no-unpublished-require
const { validationResult } = require('express-validator');
const { plansValidators } = require('../../../../app/middlewares/validator/definition/allValidators');

describe('generalValidators.js', function () {
    describe('plansValidators.title function', function () {
        it('should return error if request includes invalid body.', async function () {
            const req = {
                body: {}
            };
            const expectedResultErrors = [
                {
                    location: 'body',
                    msg: 'not empty',
                    param: 'title',
                    value: undefined
                },
                {
                    location: 'body',
                    msg: 'should be between 1 and 100 characters.',
                    param: 'title',
                    value: undefined
                }
            ];

            await plansValidators.title(req, {}, () => {});
            const result = validationResult(req);
            expect(expectedResultErrors).to.eql(result.errors);
        });
    });
});
