import Joi from 'joi'

export const updateBrandSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
}).min(1)
