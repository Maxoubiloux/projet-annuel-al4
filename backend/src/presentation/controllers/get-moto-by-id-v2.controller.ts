import { FastifyRequest, FastifyReply } from 'fastify'
import { GetMotoByIdUseCase } from '@domain/usecases/get-moto-by-id.usecase'
import { motoToV2Dto } from '@presentation/presenters/v2/moto-v2.presenter'

/**
 * Controller v2 de GET /motos/:id.
 * Réutilise le même use case que la v1 (aucun changement métier) ; seule la
 * sérialisation change via le presenter v2 (pricePerDay -> dailyPriceCents).
 */
export class GetMotoByIdV2Controller {
  constructor(private readonly getMotoByIdUseCase: GetMotoByIdUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `GET /v2/motos/${request.params.id}`)

    const result = await this.getMotoByIdUseCase.execute(request.params.id)

    if (result.isErr) {
      reply.status(404).send({
        success: false,
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      })
      return
    }

    reply.send({
      success: true,
      data: motoToV2Dto(result.value),
    })
  }
}
