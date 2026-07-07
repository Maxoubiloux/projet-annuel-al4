import { FastifyReply, FastifyRequest } from 'fastify'

export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  if (!request.user?.roles.includes('admin')) {
    return void reply.status(403).send({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' },
    })
  }
}
