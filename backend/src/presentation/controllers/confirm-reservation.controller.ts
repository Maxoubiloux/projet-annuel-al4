import { FastifyRequest, FastifyReply } from 'fastify'
import { ConfirmReservationUseCase } from '@domain/usecases/confirm-reservation.usecase'

export class ConfirmReservationController {
  constructor(private readonly confirmReservationUseCase: ConfirmReservationUseCase) { }

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `POST /reservations/${request.params.id}/confirm`)

    const result = await this.confirmReservationUseCase.execute(request.params.id)

    if (result.isErr) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 400
      reply.status(status).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.send({ success: true, data: result.value })
  }
}
