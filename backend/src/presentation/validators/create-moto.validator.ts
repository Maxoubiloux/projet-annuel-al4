import Joi from 'joi'

export const createMotoSchema = Joi.object({
  brandId: Joi.string().uuid().required(),
  model: Joi.string().trim().min(1).max(100).required(),
  serialNumber: Joi.string().trim().min(1).max(50).required(),
  registration: Joi.string().trim().min(1).max(20).required(),
  categoryId: Joi.string().uuid().required(),
  statusId: Joi.string().uuid().required(),
  currentKm: Joi.number().integer().min(0).required(),
  pricePerDay: Joi.number().positive().required(),
  description: Joi.string().trim().allow('').required(),
})
