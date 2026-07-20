import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateReservationUseCase } from '@domain/usecases/create-reservation.usecase'
import { CreateReservationParams } from '@domain/entities/Reservation'

export class CreateReservationController {
  constructor(private readonly createReservationUseCase: CreateReservationUseCase) { }

  async handle(request: FastifyRequest<{ Body: CreateReservationParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'POST /reservations — creating reservation')

    const result = await this.createReservationUseCase.execute(request.body)

    if (result.isErr) {
      reply.status(400).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.status(201).send({
      success: true,
      data: result.value,
    })
  }
}
