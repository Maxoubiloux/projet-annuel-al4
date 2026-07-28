import Joi from 'joi'

export const bookingRulesSchema = Joi.object({
  minDays: Joi.number().integer().min(1).required(),
  maxDays: Joi.number().integer().min(1).required(),
  minAge: Joi.number().integer().min(18).required(),
  freeCancelHours: Joi.number().integer().min(0).required(),
})

export const companyInfoSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  address: Joi.string().trim().min(1).max(255).required(),
  email: Joi.string().trim().email().max(255).required(),
  phone: Joi.string().trim().min(6).max(30).required(),
})

export const preferencesSchema = Joi.object({
  emailNotifications: Joi.boolean(),
}).min(1)
