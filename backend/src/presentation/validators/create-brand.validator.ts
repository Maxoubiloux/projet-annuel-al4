import Joi from 'joi'

export const createBrandSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
})
