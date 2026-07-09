import { FastifyRequest, FastifyReply } from 'fastify'
import { GetAllCustomersUseCase } from '@domain/usecases/get-all-customers.usecase'

interface CustomersQuery {
  page?: string
  limit?: string
}

export class GetAllCustomersController {
  constructor(private readonly getAllCustomersUseCase: GetAllCustomersUseCase) { }

  async handle(request: FastifyRequest<{ Querystring: CustomersQuery }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /customers')

    const page = request.query.page ? Number(request.query.page) : 1
    const limit = request.query.limit ? Number(request.query.limit) : 10
    const { items, total } = await this.getAllCustomersUseCase.execute({ page, limit })

    reply.send({ success: true, data: items, meta: { total, page, limit } })
  }
}
