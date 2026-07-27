import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { IFavoriteRepository } from '@domain/repositories/IFavoriteRepository'
import { idParamSchema } from '@presentation/validators/id-param.validator'

function requireUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.user?.id
  if (!userId) {
    reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
    })
    return null
  }
  return userId
}

export async function favoriteRoutesV1(app: FastifyInstance, opts: { favoriteRepository: IFavoriteRepository }) {
  const repo = opts.favoriteRepository

  app.get('/favorites', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = requireUserId(request, reply)
    if (!userId) return

    const motos = await repo.findMotosByUserId(userId)
    reply.send({ success: true, data: motos, meta: { total: motos.length } })
  })

  app.get('/favorites/ids', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = requireUserId(request, reply)
    if (!userId) return

    const ids = await repo.findMotoIdsByUserId(userId)
    reply.send({ success: true, data: ids, meta: { total: ids.length } })
  })

  app.post('/favorites/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = requireUserId(request, reply)
    if (!userId) return

    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }

    const moto = await repo.add(userId, request.params.id)
    if (!moto) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Moto introuvable' },
      })
      return
    }

    reply.status(201).send({ success: true, data: moto })
  })

  app.delete('/favorites/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = requireUserId(request, reply)
    if (!userId) return

    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }

    await repo.remove(userId, request.params.id)
    reply.send({ success: true, data: { id: request.params.id } })
  })
}
