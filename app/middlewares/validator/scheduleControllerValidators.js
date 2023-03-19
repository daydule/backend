'use strict';

const { scheduleValidators } = require('./definition/allValidators');

const readScheduleValidators = [scheduleValidators.date];
const updateScheduleValidators = [scheduleValidators.date, scheduleValidators.startTime, scheduleValidators.endTime];

module.exports = {
    readScheduleValidators,
    updateScheduleValidators
};
