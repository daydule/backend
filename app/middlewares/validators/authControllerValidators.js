'use strict';

const { userValidators } = require('./generalValidators');

const signupValidators = [userValidators.email, userValidators.password];

module.exports = {
    signupValidators
};
