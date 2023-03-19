'use strict';

const { plansValidators, daySettingsValidators, fixPlansValidators } = require('./definition/allValidators');

const createFixPlanValidators = [
    daySettingsValidators.dayIds,
    fixPlansValidators.setIdForCreate,
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
    fixPlansValidators.setIdForUpdate,
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
