import Joi from 'joi'
import { MotoCategory } from '@domain/entities/Moto'

export const createMotoSchema = Joi.object({
  brand: Joi.string().trim().min(1).max(100).required(),
  model: Joi.string().trim().min(1).max(100).required(),
  registration: Joi.string().trim().min(1).max(20).required(),
  category: Joi.string().valid(...Object.values(MotoCategory)).required(),
  currentKm: Joi.number().integer().min(0).required(),
  pricePerDay: Joi.number().positive().required(),
})
