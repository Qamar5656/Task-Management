import joi from 'joi'

export const registerSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    email:joi.string().email().required().messages({
        "string.email": "Please enter a valid email.",
        "string.empty": "Email is required.",
        "any.required": "Email is required."
    }),
password:joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/)
    .required()
})

export const loginSchema = joi.object({
    email: joi.string()
    .email()
    .required()
    .messages({
        "string.email": "Please enter a valid email.",
        "string.empty": "Email is required.",
        "any.required": "Email is required."
    }),
    password:joi.string().required().messages({
        "string.empty": "Invalid Credentials ",
        "string.min": "Password must be at least 8 characters long.",
        "string.pattern.base":
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        "any.required": "Password is required."
    })
})