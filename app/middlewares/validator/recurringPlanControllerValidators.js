'use strict';

const { plansValidators, daySettingsValidators, recurringPlansValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

const createRecurringPlanValidators = [
    daySettingsValidators.dayIds,
    recurringPlansValidators.setId({ isNotEmpty: false }),
    plansValidators.title,
    plansValidators.context,
    recurringPlansValidators.startTime,
    recurringPlansValidators.endTime,
    plansValidators.processTime,
    plansValidators.travelTime,
    plansValidators.bufferTime,
    plansValidators.planType,
    plansValidators.priority,
    plansValidators.place
].concat(validationResultCheck);
const updateRecurringPlanValidators = [
    recurringPlansValidators.setId({ isNotEmpty: true }),
    plansValidators.title,
    plansValidators.context,
    recurringPlansValidators.startTime,
    recurringPlansValidators.endTime,
    plansValidators.processTime,
    plansValidators.travelTime,
    plansValidators.bufferTime,
    plansValidators.planType,
    plansValidators.priority,
    plansValidators.place
].concat(validationResultCheck);
const deleteRecurringPlanValidators = [plansValidators.ids].concat(validationResultCheck);

module.exports = {
    createRecurringPlanValidators,
    updateRecurringPlanValidators,
    deleteRecurringPlanValidators
};
