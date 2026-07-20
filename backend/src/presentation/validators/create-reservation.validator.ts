import Joi from 'joi'
import { RESERVATION_STATUSES, PAYMENT_STATUSES } from '@domain/entities/Reservation'

export const createReservationSchema = Joi.object({
  motoId: Joi.string().uuid().required(),
  customerId: Joi.string().uuid().required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  totalAmount: Joi.number().positive().required(),
  depositAmount: Joi.number().min(0).required(),
  status: Joi.string().valid(...RESERVATION_STATUSES).required(),
  paymentStatus: Joi.string().valid(...PAYMENT_STATUSES).required(),
})
