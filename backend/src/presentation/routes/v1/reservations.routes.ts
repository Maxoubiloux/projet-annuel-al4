import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { IContractQueuePublisher } from '@domain/ports/IContractQueuePublisher'
import { CreateReservationParams } from '@domain/entities/Reservation'
import { CreateReservationUseCase } from '@domain/usecases/create-reservation.usecase'
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

export async function reservationRoutesV1(
  app: FastifyInstance,
  opts: {
    reservationRepository: IReservationRepository
    paymentRepository: IPaymentRepository
    contractPublisher?: IContractQueuePublisher
  },
) {
  const { reservationRepository, paymentRepository, contractPublisher } = opts

  const createReservationController = new CreateReservationController(
    new CreateReservationUseCase(reservationRepository, paymentRepository, contractPublisher),
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
