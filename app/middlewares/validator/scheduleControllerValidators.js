'use strict';

const { scheduleValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

const readScheduleValidators = [scheduleValidators.date];
const updateScheduleValidators = [scheduleValidators.date, scheduleValidators.startTime, scheduleValidators.endTime];

module.exports = {
    readScheduleValidators: readScheduleValidators.concat(validationResultCheck),
    updateScheduleValidators: updateScheduleValidators.concat(validationResultCheck)
};
