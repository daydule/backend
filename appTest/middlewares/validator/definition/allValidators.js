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
                    msg: 'タイトルは必須です。',
                    param: 'title',
                    value: undefined
                },
                {
                    location: 'body',
                    msg: 'タイトルは1文字以上100文字以下の文字列です。',
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
