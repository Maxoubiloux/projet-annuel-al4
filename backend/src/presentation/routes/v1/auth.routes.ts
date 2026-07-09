import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IIamClient } from '@domain/repositories/IIamClient'
import { ForgotPasswordUseCase } from '@domain/usecases/forgot-password.usecase'
import { ForgotPasswordController } from '@presentation/controllers/forgot-password.controller'
import { forgotPasswordSchema } from '@presentation/validators/forgot-password.validator'

export async function authRoutesV1(app: FastifyInstance, opts: { iamClient: IIamClient }) {
  const forgotPasswordController = new ForgotPasswordController(new ForgotPasswordUseCase(opts.iamClient))

  app.post('/auth/forgot-password', async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
    const { error } = forgotPasswordSchema.validate(request.body)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await forgotPasswordController.handle(request, reply)
  })
}
