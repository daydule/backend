'use strict';

const { userValidators, daySettingsValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

const updateUserValidators = [
    userValidators.nickname,
    userValidators.email,
    userValidators.password('password')
].concat(validationResultCheck);
const updateUserPasswordValidators = [
    userValidators.password('newPassword'),
    userValidators.checkDifferentPassword('currentPassword', 'newPassword')
].concat(validationResultCheck);
const updateScheduleSettingsValidators = [
    daySettingsValidators.scheduleStartTime,
    daySettingsValidators.scheduleEndTime,
    daySettingsValidators.schedulingLogic
].concat(validationResultCheck);

module.exports = {
    updateUserValidators,
    updateUserPasswordValidators,
    updateScheduleSettingsValidators
};
