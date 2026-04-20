import Joi from 'joi'

export const updateShopSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  address: Joi.string().trim().min(1).max(255),
  city: Joi.string().trim().min(1).max(100),
  zipCode: Joi.string().trim().min(1).max(10),
  country: Joi.string().trim().min(1).max(100),
  phone: Joi.string().trim().min(1).max(20),
  email: Joi.string().trim().email().max(255),
}).min(1)
