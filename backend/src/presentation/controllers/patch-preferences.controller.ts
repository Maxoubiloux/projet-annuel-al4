import { FastifyRequest, FastifyReply } from 'fastify'
import { PatchPreferencesUseCase } from '@domain/usecases/patch-preferences.usecase'
import { Preferences } from '@domain/entities/Settings'

export class PatchPreferencesController {
  constructor(private readonly patchPreferencesUseCase: PatchPreferencesUseCase) { }

  async handle(request: FastifyRequest<{ Body: Partial<Preferences> }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'PATCH /settings/preferences')

    const result = await this.patchPreferencesUseCase.execute(request.body)

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
