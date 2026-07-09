import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ISettingsRepository } from '@domain/repositories/ISettingsRepository'
import { BookingRules, CompanyInfo, Preferences } from '@domain/entities/Settings'
import { GetBookingRulesUseCase } from '@domain/usecases/get-booking-rules.usecase'
import { PutBookingRulesUseCase } from '@domain/usecases/put-booking-rules.usecase'
import { GetCompanyInfoUseCase } from '@domain/usecases/get-company-info.usecase'
import { PutCompanyInfoUseCase } from '@domain/usecases/put-company-info.usecase'
import { PatchPreferencesUseCase } from '@domain/usecases/patch-preferences.usecase'
import { GetBookingRulesController } from '@presentation/controllers/get-booking-rules.controller'
import { PutBookingRulesController } from '@presentation/controllers/put-booking-rules.controller'
import { GetCompanyInfoController } from '@presentation/controllers/get-company-info.controller'
import { PutCompanyInfoController } from '@presentation/controllers/put-company-info.controller'
import { PatchPreferencesController } from '@presentation/controllers/patch-preferences.controller'
import { bookingRulesSchema, companyInfoSchema, preferencesSchema } from '@presentation/validators/settings.validator'

export async function settingsRoutesV1(app: FastifyInstance, opts: { settingsRepository: ISettingsRepository }) {
  const repo = opts.settingsRepository

  const getBookingRulesController = new GetBookingRulesController(new GetBookingRulesUseCase(repo))
  const putBookingRulesController = new PutBookingRulesController(new PutBookingRulesUseCase(repo))
  const getCompanyInfoController = new GetCompanyInfoController(new GetCompanyInfoUseCase(repo))
  const putCompanyInfoController = new PutCompanyInfoController(new PutCompanyInfoUseCase(repo))
  const patchPreferencesController = new PatchPreferencesController(new PatchPreferencesUseCase(repo))

  app.get('/settings/rules', async (request: FastifyRequest, reply: FastifyReply) => {
    await getBookingRulesController.handle(request, reply)
  })

  app.put('/settings/rules', async (request: FastifyRequest<{ Body: BookingRules }>, reply: FastifyReply) => {
    const { error } = bookingRulesSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await putBookingRulesController.handle(request, reply)
  })

  app.get('/settings/company', async (request: FastifyRequest, reply: FastifyReply) => {
    await getCompanyInfoController.handle(request, reply)
  })

  app.put('/settings/company', async (request: FastifyRequest<{ Body: CompanyInfo }>, reply: FastifyReply) => {
    const { error } = companyInfoSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await putCompanyInfoController.handle(request, reply)
  })

  app.patch('/settings/preferences', async (request: FastifyRequest<{ Body: Partial<Preferences> }>, reply: FastifyReply) => {
    const { error } = preferencesSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await patchPreferencesController.handle(request, reply)
  })
}
