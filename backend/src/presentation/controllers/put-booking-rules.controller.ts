import { FastifyRequest, FastifyReply } from 'fastify'
import { PutBookingRulesUseCase } from '@domain/usecases/put-booking-rules.usecase'
import { BookingRules } from '@domain/entities/Settings'

export class PutBookingRulesController {
  constructor(private readonly putBookingRulesUseCase: PutBookingRulesUseCase) { }

  async handle(request: FastifyRequest<{ Body: BookingRules }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'PUT /settings/rules')

    const result = await this.putBookingRulesUseCase.execute(request.body)

    if (result.isErr) {
      reply.status(400).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.send({ success: true, data: result.value })
  }
}
