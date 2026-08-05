import Joi from "joi";

export const createCommentSchema = Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    taskId: Joi.string().required()
})