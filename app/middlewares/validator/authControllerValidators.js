'use strict';

const { userValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

const signupValidators = [userValidators.email, userValidators.password('password')].concat(validationResultCheck);

module.exports = {
    signupValidators
};
