import joi from 'joi';

export const createProjectSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    workspaceId: joi.string().required(),
})

export const getProjectsSchema = joi.object({
    workspaceId:joi.string().required(),
})

export const updateProjectSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
})