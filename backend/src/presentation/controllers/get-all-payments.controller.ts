import { FastifyRequest, FastifyReply } from 'fastify'
import { GetAllPaymentsUseCase } from '@domain/usecases/get-all-payments.usecase'

interface PaymentsQuery {
  page?: string
  limit?: string
}

export class GetAllPaymentsController {
  constructor(private readonly getAllPaymentsUseCase: GetAllPaymentsUseCase) { }

  async handle(request: FastifyRequest<{ Querystring: PaymentsQuery }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /payments')

    const page = request.query.page ? Number(request.query.page) : 1
    const limit = request.query.limit ? Number(request.query.limit) : 10
    const { items, total } = await this.getAllPaymentsUseCase.execute({ page, limit })

    reply.send({ success: true, data: items, meta: { total, page, limit } })
  }
}
