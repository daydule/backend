'use strict';

const { plansValidators } = require('./definition/allValidators');
const validationResultCheck = require('./definition/validationResultCheck');

const createPlanValidators = [
    plansValidators.title,
    plansValidators.context,
    plansValidators.date,
    plansValidators.startTime,
    plansValidators.endTime,
    plansValidators.processTime,
    plansValidators.travelTime,
    plansValidators.bufferTime,
    plansValidators.planType,
    plansValidators.priority,
    plansValidators.place,
    plansValidators.isRequiredPlan,
    plansValidators.checkWithPlanType
].concat(validationResultCheck);

const updatePlanValidators = [
    plansValidators.id,
    plansValidators.title,
    plansValidators.context,
    plansValidators.date,
    plansValidators.startTime,
    plansValidators.endTime,
    plansValidators.processTime,
    plansValidators.travelTime,
    plansValidators.bufferTime,
    plansValidators.planType,
    plansValidators.priority,
    plansValidators.place,
    plansValidators.isRequiredPlan,
    plansValidators.parentPlanId,
    plansValidators.isParentPlan,
    plansValidators.checkWithPlanType
].concat(validationResultCheck);

const deletePlanValidators = [plansValidators.id].concat(validationResultCheck);

const updateTodoPriorityValidators = [plansValidators.ids].concat(validationResultCheck);

module.exports = {
    createPlanValidators,
    updatePlanValidators,
    updateTodoPriorityValidators,
    deletePlanValidators
};
