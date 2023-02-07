'use strict';

const { plansValidationCheck, todoOrdersValidationCheck } = require('./generalValidators');

const createPlanValidators = [
    plansValidationCheck.title,
    plansValidationCheck.context,
    plansValidationCheck.date,
    plansValidationCheck.startTime,
    plansValidationCheck.endTime,
    plansValidationCheck.processTime,
    plansValidationCheck.travelTime,
    plansValidationCheck.bufferTime,
    plansValidationCheck.planType,
    plansValidationCheck.priority,
    plansValidationCheck.place,
    plansValidationCheck.isRequiredPlan,
    plansValidationCheck.todoStartTime
];

const upsertTodoPriorityValidators = [todoOrdersValidationCheck.todoOrders];

module.exports = {
    createPlanValidators,
    upsertTodoPriorityValidators
};
