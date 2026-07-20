import { FastifyRequest, FastifyReply } from 'fastify'
import { GetBookingRulesUseCase } from '@domain/usecases/get-booking-rules.usecase'

export class GetBookingRulesController {
  constructor(private readonly getBookingRulesUseCase: GetBookingRulesUseCase) { }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /settings/rules')

    const rules = await this.getBookingRulesUseCase.execute()

    reply.send({ success: true, data: rules })
  }
}
