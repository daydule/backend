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
    plansValidators.todoStartTime
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
    plansValidators.todoStartTime
];

const deletePlanValidators = [plansValidators.id];

const createTemporaryPlanValidators = [
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
    plansValidators.todoStartTime
];

const upsertTodoPriorityValidators = [todoOrdersValidators.todoOrders];

module.exports = {
    createPlanValidators,
    updatePlanValidators,
    upsertTodoPriorityValidators,
    deletePlanValidators,
    createTemporaryPlanValidators
};
