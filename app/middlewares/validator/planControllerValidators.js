'use strict';

const { plansValidators, todoOrdersValidators } = require('./definition/allValidators');
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
    plansValidators.todoStartTime,
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
    plansValidators.todoStartTime,
    plansValidators.checkWithPlanType
].concat(validationResultCheck);

const deletePlanValidators = [plansValidators.id].concat(validationResultCheck);

const createTemporaryPlanValidators = [
    plansValidators.title,
    plansValidators.context,
    plansValidators.date,
    plansValidators.startTime,
    plansValidators.endTime,
    plansValidators.processTime,
    plansValidators.planType,
    plansValidators.travelTime,
    plansValidators.bufferTime,
    plansValidators.priority,
    plansValidators.place,
    plansValidators.todoStartTime,
    plansValidators.checkWithPlanType
].concat(validationResultCheck);

const upsertTodoPriorityValidators = [todoOrdersValidators.todoOrders].concat(validationResultCheck);

module.exports = {
    createPlanValidators,
    updatePlanValidators,
    upsertTodoPriorityValidators,
    deletePlanValidators,
    createTemporaryPlanValidators
};
