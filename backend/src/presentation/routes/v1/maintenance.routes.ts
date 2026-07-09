import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IMaintenanceRepository } from '@domain/repositories/IMaintenanceRepository'
import { CreateMaintenanceParams, UpdateMaintenanceParams } from '@domain/entities/MaintenanceJob'
import { CreateMaintenanceUseCase } from '@domain/usecases/create-maintenance.usecase'
import { GetAllMaintenanceUseCase } from '@domain/usecases/get-all-maintenance.usecase'
import { GetMaintenanceAlertsUseCase } from '@domain/usecases/get-maintenance-alerts.usecase'
import { UpdateMaintenanceUseCase } from '@domain/usecases/update-maintenance.usecase'
import { CreateMaintenanceController } from '@presentation/controllers/create-maintenance.controller'
import { GetAllMaintenanceController } from '@presentation/controllers/get-all-maintenance.controller'
import { GetMaintenanceAlertsController } from '@presentation/controllers/get-maintenance-alerts.controller'
import { UpdateMaintenanceController } from '@presentation/controllers/update-maintenance.controller'
import { createMaintenanceSchema, updateMaintenanceSchema } from '@presentation/validators/create-maintenance.validator'
import { idParamSchema } from '@presentation/validators/id-param.validator'

export async function maintenanceRoutesV1(app: FastifyInstance, opts: { maintenanceRepository: IMaintenanceRepository }) {
  const repo = opts.maintenanceRepository

  const createMaintenanceController = new CreateMaintenanceController(new CreateMaintenanceUseCase(repo))
  const getAllMaintenanceController = new GetAllMaintenanceController(new GetAllMaintenanceUseCase(repo))
  const getMaintenanceAlertsController = new GetMaintenanceAlertsController(new GetMaintenanceAlertsUseCase(repo))
  const updateMaintenanceController = new UpdateMaintenanceController(new UpdateMaintenanceUseCase(repo))

  app.get('/maintenance/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    await getMaintenanceAlertsController.handle(request as never, reply)
  })

  app.get('/maintenance', async (request: FastifyRequest, reply: FastifyReply) => {
    await getAllMaintenanceController.handle(request as never, reply)
  })

  app.post('/maintenance', async (request: FastifyRequest<{ Body: CreateMaintenanceParams }>, reply: FastifyReply) => {
    const { error } = createMaintenanceSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await createMaintenanceController.handle(request, reply)
  })

  app.patch('/maintenance/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateMaintenanceParams }>, reply: FastifyReply) => {
    const paramValidation = idParamSchema.validate(request.params)
    if (paramValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: paramValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    const bodyValidation = updateMaintenanceSchema.validate(request.body, { abortEarly: false })
    if (bodyValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: bodyValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    await updateMaintenanceController.handle(request, reply)
  })
}
