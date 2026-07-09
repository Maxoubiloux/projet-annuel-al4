import Joi from 'joi'
import { MAINTENANCE_SEVERITIES, MAINTENANCE_STATUSES } from '@domain/entities/MaintenanceJob'

export const createMaintenanceSchema = Joi.object({
  motoId: Joi.string().uuid().required(),
  moto: Joi.string().allow('').optional(),
  plate: Joi.string().allow('').optional(),
  type: Joi.string().trim().min(1).max(100).required(),
  date: Joi.string().isoDate().required(),
  km: Joi.string().trim().pattern(/^\d+$/).required(),
  cost: Joi.number().min(0).required(),
  sev: Joi.string().valid(...MAINTENANCE_SEVERITIES).required(),
  status: Joi.string().valid(...MAINTENANCE_STATUSES).required(),
  notes: Joi.string().trim().allow('').optional(),
})

export const updateMaintenanceSchema = Joi.object({
  status: Joi.string().valid(...MAINTENANCE_STATUSES),
  notes: Joi.string().trim().allow(''),
  cost: Joi.number().min(0),
}).min(1)
