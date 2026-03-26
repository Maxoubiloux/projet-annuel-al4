import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export async function motoroutesV2(app: FastifyInstance) {
  app.get('/motos/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = (request as any).correlationId
    const { id } = request.params as { id: string }

    app.log.info({ correlationId, motoId: id }, 'GET /motos/:id (v2)')

    reply.send({
      data: {
        id,
        brand: 'Yamaha',
        model: 'MT-09',
        category: 'A',
        pricePerDay: 50,
        status: 'PUBLISHED',
      },
      metadata: {
        version: '2.0',
        lastUpdated: new Date().toISOString(),
      },
    })
  })
}
