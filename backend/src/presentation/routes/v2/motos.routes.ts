import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { GetMotoByIdUseCase } from '@domain/usecases/get-moto-by-id.usecase'
import { GetMotoByIdV2Controller } from '@presentation/controllers/get-moto-by-id-v2.controller'
import { idParamSchema } from '@presentation/validators/id-param.validator'

export async function motoRoutesV2(app: FastifyInstance, opts: { motoRepository: IMotoRepository }) {
  const getMotoByIdV2Controller = new GetMotoByIdV2Controller(new GetMotoByIdUseCase(opts.motoRepository))

  app.get('/motos/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await getMotoByIdV2Controller.handle(request, reply)
  })
}
