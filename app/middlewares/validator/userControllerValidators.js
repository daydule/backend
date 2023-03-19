'use strict';

const { userValidators, daySettingsValidators } = require('./definition/allValidators');

const updateUserValidators = [userValidators.nickname, userValidators.email, userValidators.password('password')];
const updateUserPasswordValidators = [
    userValidators.password(['currentPassword', 'newPassword']),
    userValidators.checkDifferentPassword('newPassword', 'currentPassword')
];
const updateScheduleSettingsValidators = [
    daySettingsValidators.scheduleStartTime,
    daySettingsValidators.scheduleEndTime,
    daySettingsValidators.schedulingLogic
];

module.exports = {
    updateUserValidators,
    updateUserPasswordValidators,
    updateScheduleSettingsValidators
};
