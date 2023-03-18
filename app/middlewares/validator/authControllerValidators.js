'use strict';

const { userValidators } = require('./definition/allValidators');

const signupValidators = [userValidators.email, userValidators.password];

module.exports = {
    signupValidators
};
