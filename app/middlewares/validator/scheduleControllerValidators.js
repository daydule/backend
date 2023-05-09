'use strict';

const { scheduleValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

const readScheduleValidators = [scheduleValidators.date].concat(validationResultCheck);
const createScheduleValidators = [scheduleValidators.date].concat(validationResultCheck);
const updateScheduleValidators = [
    scheduleValidators.date,
    scheduleValidators.startTime,
    scheduleValidators.endTime
].concat(validationResultCheck);

module.exports = {
    readScheduleValidators,
    createScheduleValidators,
    updateScheduleValidators
};
