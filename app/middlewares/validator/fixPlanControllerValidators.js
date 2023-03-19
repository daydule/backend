'use strict';

const { plansValidators, daySettingsValidators, fixPlansValidators } = require('./definition/allValidators');

const createFixPlanValidators = [
    daySettingsValidators.dayIds,
    fixPlansValidators.setId({ isNotEmpty: false }),
    plansValidators.title,
    plansValidators.context,
    fixPlansValidators.startTime,
    fixPlansValidators.endTime,
    plansValidators.processTime,
    plansValidators.travelTime,
    plansValidators.bufferTime,
    plansValidators.planType,
    plansValidators.priority,
    plansValidators.place
];
const updateFixPlanValidators = [
    fixPlansValidators.setId({ isNotEmpty: true }),
    plansValidators.title,
    plansValidators.context,
    fixPlansValidators.startTime,
    fixPlansValidators.endTime,
    plansValidators.processTime,
    plansValidators.travelTime,
    plansValidators.bufferTime,
    plansValidators.planType,
    plansValidators.priority,
    plansValidators.place
];
const deleteFixPlanValidators = [plansValidators.ids];

module.exports = {
    createFixPlanValidators,
    updateFixPlanValidators,
    deleteFixPlanValidators
};
