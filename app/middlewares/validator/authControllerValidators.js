'use strict';

const { userValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

const signupValidators = [userValidators.email, userValidators.password('password')];

module.exports = {
    signupValidators: signupValidators.concat(validationResultCheck)
};
