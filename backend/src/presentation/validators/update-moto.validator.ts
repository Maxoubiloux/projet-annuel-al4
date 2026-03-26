import Joi from 'joi'

export const updateMotoSchema = Joi.object({
  brandId: Joi.string().uuid(),
  model: Joi.string().trim().min(1).max(100),
  serialNumber: Joi.string().trim().min(1).max(50),
  registration: Joi.string().trim().min(1).max(20),
  categoryId: Joi.string().uuid(),
  statusId: Joi.string().uuid(),
  currentKm: Joi.number().integer().min(0),
  pricePerDay: Joi.number().positive(),
  description: Joi.string().trim().allow(''),
}).min(1)
