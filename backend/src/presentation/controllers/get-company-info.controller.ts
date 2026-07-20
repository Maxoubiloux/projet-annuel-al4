import { FastifyRequest, FastifyReply } from 'fastify'
import { GetCompanyInfoUseCase } from '@domain/usecases/get-company-info.usecase'

export class GetCompanyInfoController {
  constructor(private readonly getCompanyInfoUseCase: GetCompanyInfoUseCase) { }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /settings/company')

    const info = await this.getCompanyInfoUseCase.execute()

    reply.send({ success: true, data: info })
  }
}
