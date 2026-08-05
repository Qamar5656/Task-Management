import joi from 'joi';

export const createWorkspaceSchema = joi.object({
    name: joi.string().min(3).max(50).required().messages({
        "string.empty": "Workspace name is required.",
        "string.min": "Workspace name must be at least 3 characters long.",
        "any.required": "Workspace name is required."
    })
});

export const updateWorkspaceSchema = joi.object({
    name: joi.string().min(3).max(50).required()
});

export const addMemberSchema = joi.object({
    email: joi.string().email().required(),
    role: joi.string().valid('ADMIN', 'MEMBER', 'VIEWER').required()
});
