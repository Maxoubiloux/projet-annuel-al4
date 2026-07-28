import { FastifyRequest, FastifyReply } from 'fastify'
import { CancelReservationUseCase } from '@domain/usecases/cancel-reservation.usecase'

export class CancelReservationController {
  constructor(private readonly cancelReservationUseCase: CancelReservationUseCase) { }

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `POST /reservations/${request.params.id}/cancel`)

    const result = await this.cancelReservationUseCase.execute(request.params.id)

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
