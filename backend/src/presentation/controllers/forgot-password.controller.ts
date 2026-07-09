import { FastifyRequest, FastifyReply } from 'fastify'
import { ForgotPasswordUseCase } from '@domain/usecases/forgot-password.usecase'

export class ForgotPasswordController {
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) { }

  async handle(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'POST /auth/forgot-password')

    const result = await this.forgotPasswordUseCase.execute(request.body.email)

    if (result.isErr) {
      reply.status(400).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.send({
      success: true,
      data: { message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.' },
    })
  }
}
