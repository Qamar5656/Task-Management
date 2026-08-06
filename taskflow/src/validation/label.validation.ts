import Joi from 'joi';

export const createLabelSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    color: Joi.string().regex(/^#[0-9A-Fa-f]{6}$/).required().messages({
        "string.pattern.base": "Color must be a valid hex code (e.g. #FF5733)"
    }),
    workspaceId: Joi.string().required()
});

export const attachLabelSchema = Joi.object({
    labelId: Joi.string().required(),
    taskId: Joi.string().required()
});
