import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IIamClient } from '@domain/repositories/IIamClient'
import { ForgotPasswordUseCase } from '@domain/usecases/forgot-password.usecase'
import { ForgotPasswordController } from '@presentation/controllers/forgot-password.controller'
import { forgotPasswordSchema } from '@presentation/validators/forgot-password.validator'

export async function authRoutesV1(app: FastifyInstance, opts: { iamClient: IIamClient }) {
  const forgotPasswordController = new ForgotPasswordController(new ForgotPasswordUseCase(opts.iamClient))

  app.post('/auth/login', async (request: FastifyRequest<{ Body: { email: string; password: string; otp?: string } }>, reply: FastifyReply) => {
    const email = request.body.email?.trim()
    const password = request.body.password
    const otp = request.body.otp?.trim()
    if (!email?.includes('@') || !password) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email et mot de passe requis' },
      })
      return
    }

    try {
      const session = await opts.iamClient.login(email, password, otp)
      reply.send({ success: true, data: session })
    } catch (error) {
      reply.status(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: error instanceof Error ? error.message : 'Identifiants invalides' },
      })
    }
  })

  app.post(
    '/auth/register',
    async (request: FastifyRequest<{ Body: {
      email: string
      password: string
      firstName: string
      lastName: string
      phone: string
      address: string
      zipCode: string
      city: string
      licenseCategory: 'A1' | 'A2' | 'A'
      licenseNumber: string
    } }>, reply: FastifyReply) => {
      const email = request.body.email?.trim()
      const password = request.body.password
      const firstName = request.body.firstName?.trim()
      const lastName = request.body.lastName?.trim()
      const phone = request.body.phone?.trim()
      const address = request.body.address?.trim()
      const zipCode = request.body.zipCode?.trim()
      const city = request.body.city?.trim()
      const licenseCategory = request.body.licenseCategory
      const licenseNumber = request.body.licenseNumber?.trim()

      if (!email?.includes('@') || !password || password.length < 8 || !firstName || !lastName || !phone || !address || !zipCode || !city || !['A1', 'A2', 'A'].includes(licenseCategory) || !licenseNumber) {
        reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Prénom, nom, téléphone, adresse, code postal, ville, permis, numéro de permis, email valide et mot de passe de 8 caractères requis',
          },
        })
        return
      }

      try {
        const session = await opts.iamClient.register({ email, password, firstName, lastName, phone, address, zipCode, city, licenseCategory, licenseNumber })
        reply.status(201).send({ success: true, data: session })
      } catch (error) {
        reply.status(400).send({
          success: false,
          error: { code: 'REGISTRATION_FAILED', message: error instanceof Error ? error.message : 'Création du compte impossible' },
        })
      }
    },
  )

  app.post('/auth/refresh', async (
    request: FastifyRequest<{ Body: { refreshToken: string } }>,
    reply: FastifyReply,
  ) => {
    const refreshToken = request.body.refreshToken?.trim()
    if (!refreshToken) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Refresh token requis' },
      })
      return
    }

    try {
      const session = await opts.iamClient.refresh(refreshToken)
      reply.send({ success: true, data: session })
    } catch {
      reply.status(401).send({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session expirée, reconnectez-vous' },
      })
    }
  })

  app.get('/auth/me/2fa', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.id) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
      })
      return
    }

    try {
      const status = await opts.iamClient.getTwoFactorStatus(request.user.id)
      reply.send({ success: true, data: status })
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'TWO_FACTOR_STATUS_FAILED', message: error instanceof Error ? error.message : 'Statut A2F indisponible' },
      })
    }
  })

  app.post('/auth/me/2fa/setup', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.id) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
      })
      return
    }

    try {
      const setup = await opts.iamClient.createTwoFactorSetup(request.user.id)
      reply.send({ success: true, data: setup })
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'TWO_FACTOR_SETUP_FAILED', message: error instanceof Error ? error.message : 'Initialisation A2F impossible' },
      })
    }
  })

  app.post('/auth/me/2fa/enable', async (
    request: FastifyRequest<{ Body: { secret: string; code: string } }>,
    reply: FastifyReply,
  ) => {
    if (!request.user?.id) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
      })
      return
    }

    const secret = request.body.secret?.trim()
    const code = request.body.code?.trim()
    if (!secret || !/^\d{6}$/.test(code ?? '')) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Secret et code A2F à 6 chiffres requis' },
      })
      return
    }

    try {
      await opts.iamClient.enableTwoFactor(request.user.id, secret, code)
      reply.send({ success: true, data: { enabled: true } })
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'TWO_FACTOR_ENABLE_FAILED', message: error instanceof Error ? error.message : 'Activation A2F impossible' },
      })
    }
  })

  app.delete('/auth/me/2fa', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.id) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
      })
      return
    }

    try {
      await opts.iamClient.disableTwoFactor(request.user.id)
      reply.send({ success: true, data: { enabled: false } })
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'TWO_FACTOR_DISABLE_FAILED', message: error instanceof Error ? error.message : 'Désactivation A2F impossible' },
      })
    }
  })

  app.patch(
    '/auth/me',
    async (request: FastifyRequest<{ Body: {
      email: string
      phone: string
      address: string
      zipCode: string
      city: string
      licenseCategory: 'A1' | 'A2' | 'A'
    } }>, reply: FastifyReply) => {
      const email = request.body.email?.trim()
      const phone = request.body.phone?.trim()
      const address = request.body.address?.trim()
      const zipCode = request.body.zipCode?.trim()
      const city = request.body.city?.trim()
      const licenseCategory = request.body.licenseCategory

      if (!request.user?.id) {
        reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
        })
        return
      }

      if (!email?.includes('@') || !phone || !address || !zipCode || !city || !['A1', 'A2', 'A'].includes(licenseCategory)) {
        reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email, téléphone, adresse, code postal, ville et catégorie de permis requis' },
        })
        return
      }

      try {
        const session = await opts.iamClient.updateUser(request.user.id, { email, phone, address, zipCode, city, licenseCategory })
        reply.send({ success: true, data: { user: session.user } })
      } catch (error) {
        reply.status(400).send({
          success: false,
          error: { code: 'ACCOUNT_UPDATE_FAILED', message: error instanceof Error ? error.message : 'Mise à jour du compte impossible' },
        })
      }
    },
  )

  app.patch(
    '/auth/me/password',
    async (request: FastifyRequest<{ Body: { currentPassword: string; newPassword: string } }>, reply: FastifyReply) => {
      const currentPassword = request.body.currentPassword
      const newPassword = request.body.newPassword

      if (!request.user?.id) {
        reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
        })
        return
      }

      if (!currentPassword || !newPassword || newPassword.length < 8) {
        reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Mot de passe actuel et nouveau mot de passe de 8 caractères requis' },
        })
        return
      }

      try {
        await opts.iamClient.updatePassword(request.user.id, currentPassword, newPassword)
        reply.send({ success: true, data: { message: 'Mot de passe mis à jour' } })
      } catch {
        reply.status(400).send({
          success: false,
          error: { code: 'PASSWORD_UPDATE_FAILED', message: 'Mot de passe actuel invalide ou mise à jour impossible' },
        })
      }
    },
  )

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
