import Joi from 'joi'
import { MOTO_STATUSES } from '@domain/entities/Moto'

export const createMotoSchema = Joi.object({
  brand: Joi.string().trim().min(1).max(100).required(),
  model: Joi.string().trim().min(1).max(100).required(),
  plate: Joi.string().trim().min(1).max(20).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  category: Joi.string().trim().min(1).max(50).required(),
  mileage: Joi.number().min(0).required(),
  pricePerDay: Joi.number().positive().required(),
  deposit: Joi.number().min(0).required(),
  status: Joi.string().valid(...MOTO_STATUSES).required(),
  location: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().allow('').required(),
  imageUrl: Joi.string().trim().allow('').optional(),
  nextServiceDate: Joi.string().trim().allow('').optional(),
  style: Joi.string().trim().allow('').optional(),
  hp: Joi.number().min(0).optional(),
  torque: Joi.number().min(0).optional(),
  consumption: Joi.number().min(0).optional(),
  range: Joi.number().integer().min(0).optional(),
})
