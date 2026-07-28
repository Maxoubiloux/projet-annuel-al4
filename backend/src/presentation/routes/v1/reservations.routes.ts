import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { IContractQueuePublisher } from '@domain/ports/IContractQueuePublisher'
import { IPaymentGateway } from '@domain/repositories/IPaymentGateway'
import { CreateReservationParams } from '@domain/entities/Reservation'
import { CreateReservationUseCase } from '@domain/usecases/create-reservation.usecase'
import { CreateClientReservationUseCase } from '@domain/usecases/create-client-reservation.usecase'
import { StartClientReservationPaymentUseCase } from '@domain/usecases/start-client-reservation-payment.usecase'
import { ConfirmClientReservationPaymentUseCase } from '@domain/usecases/confirm-client-reservation-payment.usecase'
import { GetAllReservationsUseCase } from '@domain/usecases/get-all-reservations.usecase'
import { GetRecentReservationsUseCase } from '@domain/usecases/get-recent-reservations.usecase'
import { ConfirmReservationUseCase } from '@domain/usecases/confirm-reservation.usecase'
import { CancelReservationUseCase } from '@domain/usecases/cancel-reservation.usecase'
import { RefundReservationUseCase } from '@domain/usecases/refund-reservation.usecase'
import { CreateReservationController } from '@presentation/controllers/create-reservation.controller'
import { GetReservationsController } from '@presentation/controllers/get-reservations.controller'
import { ConfirmReservationController } from '@presentation/controllers/confirm-reservation.controller'
import { CancelReservationController } from '@presentation/controllers/cancel-reservation.controller'
import { RefundReservationController } from '@presentation/controllers/refund-reservation.controller'
import { createReservationSchema } from '@presentation/validators/create-reservation.validator'
import { idParamSchema } from '@presentation/validators/id-param.validator'
import Joi from 'joi'

const createClientReservationSchema = Joi.object({
  motoId: Joi.string().uuid().required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
})

const confirmClientReservationPaymentSchema = Joi.object({
  sessionId: Joi.string().trim().min(1).required(),
})

function resolveFrontendUrl(request: FastifyRequest): string {
  const fallback = process.env.FRONTEND_URL ?? 'http://localhost:3001'
  const origin = request.headers.origin
  if (!origin) return fallback

  const allowedOrigins = (process.env.CORS_ORIGIN ?? fallback)
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  return allowedOrigins.includes(origin) ? origin : fallback
}

export async function reservationRoutesV1(
  app: FastifyInstance,
  opts: {
    reservationRepository: IReservationRepository
    paymentRepository: IPaymentRepository
    contractPublisher?: IContractQueuePublisher
    paymentGateway: IPaymentGateway
  },
) {
  const { reservationRepository, paymentRepository, contractPublisher, paymentGateway } = opts

  const createReservationController = new CreateReservationController(
    new CreateReservationUseCase(reservationRepository, paymentRepository, contractPublisher),
  )
  const createClientReservationUseCase = new CreateClientReservationUseCase(reservationRepository, paymentRepository)
  const startClientReservationPaymentUseCase = new StartClientReservationPaymentUseCase(
    reservationRepository,
    paymentGateway,
  )
  const confirmClientReservationPaymentUseCase = new ConfirmClientReservationPaymentUseCase(
    reservationRepository,
    paymentRepository,
    paymentGateway,
  )
  const getReservationsController = new GetReservationsController(
    new GetAllReservationsUseCase(reservationRepository),
    new GetRecentReservationsUseCase(reservationRepository),
  )
  const confirmReservationController = new ConfirmReservationController(
    new ConfirmReservationUseCase(reservationRepository),
  )
  const cancelReservationController = new CancelReservationController(
    new CancelReservationUseCase(reservationRepository),
  )
  const refundReservationController = new RefundReservationController(
    new RefundReservationUseCase(reservationRepository, paymentRepository),
  )

  app.get('/reservations', async (request: FastifyRequest, reply: FastifyReply) => {
    await getReservationsController.handle(request as never, reply)
  })

  app.get('/reservations/me', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.id) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
      })
      return
    }

    const { items, total } = await new GetAllReservationsUseCase(reservationRepository).execute({
      page: 1,
      limit: 100,
      customerId: request.user.id,
    })
    reply.send({ success: true, data: items, meta: { total, page: 1, limit: 100 } })
  })

  app.post(
    '/reservations/me',
    async (request: FastifyRequest<{ Body: { motoId: string; startDate: string; endDate: string } }>, reply: FastifyReply) => {
      if (!request.user?.id) {
        reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
        })
        return
      }

      const { error } = createClientReservationSchema.validate(request.body, { abortEarly: false })
      if (error) {
        reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
        })
        return
      }

      const result = await createClientReservationUseCase.execute({
        motoId: request.body.motoId,
        userId: request.user.id,
        email: request.user.email,
        firstName: request.user.firstName,
        lastName: request.user.lastName,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
      })

      if (result.isErr) {
        reply.status(result.error.code === 'NOT_FOUND' ? 404 : 400).send({
          success: false,
          error: { code: result.error.code, message: result.error.message },
        })
        return
      }

      reply.status(201).send({ success: true, data: result.value })
    },
  )

  app.post(
    '/reservations/me/:id/pay',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      if (!request.user?.id) {
        reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
        })
        return
      }

      const paramsValidation = idParamSchema.validate(request.params)
      if (paramsValidation.error) {
        reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: paramsValidation.error.details.map(d => d.message).join(', ') },
        })
        return
      }

      const frontendUrl = resolveFrontendUrl(request)
      const result = await startClientReservationPaymentUseCase.execute(request.params.id, request.user.id, frontendUrl)
      if (result.isErr) {
        const status = result.error.code === 'NOT_FOUND'
          ? 404
          : result.error.code === 'FORBIDDEN'
            ? 403
            : 400
        reply.status(status).send({
          success: false,
          error: { code: result.error.code, message: result.error.message },
        })
        return
      }

      reply.send({ success: true, data: result.value })
    },
  )

  app.post(
    '/reservations/me/:id/confirm-payment',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: { sessionId: string } }>,
      reply: FastifyReply,
    ) => {
      if (!request.user?.id) {
        reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
        })
        return
      }

      const paramsValidation = idParamSchema.validate(request.params)
      if (paramsValidation.error) {
        reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: paramsValidation.error.details.map(d => d.message).join(', ') },
        })
        return
      }

      const bodyValidation = confirmClientReservationPaymentSchema.validate(request.body, { abortEarly: false })
      if (bodyValidation.error) {
        reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: bodyValidation.error.details.map(d => d.message).join(', ') },
        })
        return
      }

      const result = await confirmClientReservationPaymentUseCase.execute(
        request.params.id,
        request.user.id,
        request.body.sessionId,
      )
      if (result.isErr) {
        const status = result.error.code === 'NOT_FOUND'
          ? 404
          : result.error.code === 'FORBIDDEN'
            ? 403
            : 400
        reply.status(status).send({
          success: false,
          error: { code: result.error.code, message: result.error.message },
        })
        return
      }

      reply.send({ success: true, data: result.value })
    },
  )

  app.post('/reservations', async (request: FastifyRequest<{ Body: CreateReservationParams }>, reply: FastifyReply) => {
    const { error } = createReservationSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await createReservationController.handle(request, reply)
  })

  app.post('/reservations/:id/confirm', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await confirmReservationController.handle(request, reply)
  })

  app.post('/reservations/:id/cancel', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await cancelReservationController.handle(request, reply)
  })

  app.post('/reservations/:id/refund', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await refundReservationController.handle(request, reply)
  })
}
