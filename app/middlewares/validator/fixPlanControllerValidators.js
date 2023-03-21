'use strict';

const { plansValidators, daySettingsValidators, fixPlansValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

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
].concat(validationResultCheck);
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
].concat(validationResultCheck);
const deleteFixPlanValidators = [plansValidators.ids].concat(validationResultCheck);

module.exports = {
    createFixPlanValidators,
    updateFixPlanValidators,
    deleteFixPlanValidators
};
