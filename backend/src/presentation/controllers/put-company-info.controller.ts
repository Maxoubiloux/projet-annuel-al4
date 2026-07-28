import { FastifyRequest, FastifyReply } from 'fastify'
import { PutCompanyInfoUseCase } from '@domain/usecases/put-company-info.usecase'
import { CompanyInfo } from '@domain/entities/Settings'

export class PutCompanyInfoController {
  constructor(private readonly putCompanyInfoUseCase: PutCompanyInfoUseCase) { }

  async handle(request: FastifyRequest<{ Body: CompanyInfo }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'PUT /settings/company')

    const result = await this.putCompanyInfoUseCase.execute(request.body)

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
