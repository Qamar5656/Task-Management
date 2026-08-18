import Joi from 'joi';

export const createTaskSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(1000).optional(),
    projectId: Joi.string().required(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED').default('TODO'),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    userId: Joi.string().optional().allow(null, ''),
    startDate: Joi.date().iso().optional().allow(null),
    dueDate: Joi.date().iso().optional().allow(null),
    estimate: Joi.number().integer().min(0).optional().allow(null)
});

export const updateTaskSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(1000).optional(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    userId: Joi.string().optional().allow(null, ''),
    startDate: Joi.date().iso().optional().allow(null),
    dueDate: Joi.date().iso().optional().allow(null),
    estimate: Joi.number().integer().min(0).optional().allow(null)
});
