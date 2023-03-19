'use strict';

const { userValidators } = require('./definition/allValidators');

const signupValidators = [userValidators.email, userValidators.password('password')];

module.exports = {
    signupValidators
};
