import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export async function motoroutesV1(app: FastifyInstance) {
  app.get('/motos', async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = (request as any).correlationId

    app.log.info({ correlationId }, 'GET /motos')

    reply.send({
      data: [],
      metadata: { total: 0 },
    })
  })
}
