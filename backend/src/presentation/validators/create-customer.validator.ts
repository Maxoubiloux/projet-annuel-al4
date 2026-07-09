import Joi from 'joi'
import { CUSTOMER_STATUSES } from '@domain/entities/Customer'

export const createCustomerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().max(255).required(),
  phone: Joi.string().trim().min(6).max(30).required(),
  licenseNumber: Joi.string().trim().min(1).max(50).required(),
  licenseVerified: Joi.boolean().required(),
  status: Joi.string().valid(...CUSTOMER_STATUSES).required(),
})

export const updateCustomerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100),
  lastName: Joi.string().trim().min(1).max(100),
  email: Joi.string().trim().email().max(255),
  phone: Joi.string().trim().min(6).max(30),
  licenseNumber: Joi.string().trim().min(1).max(50),
  licenseVerified: Joi.boolean(),
  status: Joi.string().valid(...CUSTOMER_STATUSES),
}).min(1)

export const updateCustomerStatusSchema = Joi.object({
  status: Joi.string().valid(...CUSTOMER_STATUSES).required(),
})
