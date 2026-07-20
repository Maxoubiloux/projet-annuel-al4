import Joi from 'joi'
import { MOTO_STATUSES } from '@domain/entities/Moto'

export const updateMotoSchema = Joi.object({
  brand: Joi.string().trim().min(1).max(100),
  model: Joi.string().trim().min(1).max(100),
  plate: Joi.string().trim().min(1).max(20),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  category: Joi.string().trim().min(1).max(50),
  mileage: Joi.number().min(0),
  pricePerDay: Joi.number().positive(),
  deposit: Joi.number().min(0),
  status: Joi.string().valid(...MOTO_STATUSES),
  location: Joi.string().trim().min(1).max(255),
  description: Joi.string().trim().allow(''),
  imageUrl: Joi.string().trim().allow(''),
  nextServiceDate: Joi.string().trim().allow(''),
}).min(1)
