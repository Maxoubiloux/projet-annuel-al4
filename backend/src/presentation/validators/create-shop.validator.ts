import Joi from 'joi'

export const createShopSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  address: Joi.string().trim().min(1).max(255).required(),
  city: Joi.string().trim().min(1).max(100).required(),
  zipCode: Joi.string().trim().min(1).max(10).required(),
  country: Joi.string().trim().min(1).max(100).required(),
  phone: Joi.string().trim().min(1).max(20).required(),
  email: Joi.string().trim().email().max(255).required(),
})
