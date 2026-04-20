import { FastifyRequest, FastifyReply } from 'fastify'
import { GetAllBrandsUseCase } from '@domain/usecases/get-all-brands.usecase'

export class GetAllBrandsController {
  constructor(private readonly getAllBrandsUseCase: GetAllBrandsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /brands')

    const brands = await this.getAllBrandsUseCase.execute()

    reply.send({
      success: true,
      data: brands,
      meta: { total: brands.length },
    })
  }
}
