'use strict';

const { plansValidators, todoOrdersValidators } = require('./definition/allValidators');

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
];

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
];

const deletePlanValidators = [plansValidators.id];

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
];

const upsertTodoPriorityValidators = [todoOrdersValidators.todoOrders];

module.exports = {
    createPlanValidators,
    updatePlanValidators,
    upsertTodoPriorityValidators,
    deletePlanValidators,
    createTemporaryPlanValidators
};
