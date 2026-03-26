import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { CreateMotoController } from '@presentation/controllers/create-moto.controller'
import { CreateMotoUseCase } from '@domain/usecases/create-moto.usecase'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { createMotoSchema } from '@presentation/validators/create-moto.validator'
import { CreateMotoParams } from '@domain/entities/Moto'

export async function motoroutesV1(app: FastifyInstance, opts: { motoRepository: IMotoRepository }) {
  const createMotoUseCase = new CreateMotoUseCase(opts.motoRepository)
  const createMotoController = new CreateMotoController(createMotoUseCase)

  app.get('/motos', async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = request.id

    app.log.info({ correlationId }, 'GET /motos')

    reply.send({
      success: true,
      data: [],
      meta: { total: 0 },
    })
  })

  app.post('/motos', async (request: FastifyRequest<{ Body: CreateMotoParams }>, reply: FastifyReply) => {
    const { error } = createMotoSchema.validate(request.body, { abortEarly: false })

    if (error) {
      reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details.map(d => d.message).join(', '),
        },
      })
      return
    }

    await createMotoController.handle(request, reply)
  })
}
