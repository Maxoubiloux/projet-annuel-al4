import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository'
import { CreateCustomerParams, UpdateCustomerParams } from '@domain/entities/Customer'
import { CreateCustomerUseCase } from '@domain/usecases/create-customer.usecase'
import { GetAllCustomersUseCase } from '@domain/usecases/get-all-customers.usecase'
import { UpdateCustomerUseCase } from '@domain/usecases/update-customer.usecase'
import { UpdateCustomerStatusUseCase } from '@domain/usecases/update-customer-status.usecase'
import { CreateCustomerController } from '@presentation/controllers/create-customer.controller'
import { GetAllCustomersController } from '@presentation/controllers/get-all-customers.controller'
import { UpdateCustomerController } from '@presentation/controllers/update-customer.controller'
import { UpdateCustomerStatusController } from '@presentation/controllers/update-customer-status.controller'
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
} from '@presentation/validators/create-customer.validator'
import { idParamSchema } from '@presentation/validators/id-param.validator'

export async function customerRoutesV1(app: FastifyInstance, opts: { customerRepository: ICustomerRepository }) {
  const repo = opts.customerRepository

  const createCustomerController = new CreateCustomerController(new CreateCustomerUseCase(repo))
  const getAllCustomersController = new GetAllCustomersController(new GetAllCustomersUseCase(repo))
  const updateCustomerController = new UpdateCustomerController(new UpdateCustomerUseCase(repo))
  const updateCustomerStatusController = new UpdateCustomerStatusController(new UpdateCustomerStatusUseCase(repo))

  app.get('/customers', async (request: FastifyRequest, reply: FastifyReply) => {
    await getAllCustomersController.handle(request as never, reply)
  })

  app.post('/customers', async (request: FastifyRequest<{ Body: CreateCustomerParams }>, reply: FastifyReply) => {
    const { error } = createCustomerSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await createCustomerController.handle(request, reply)
  })

  app.put('/customers/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerParams }>, reply: FastifyReply) => {
    const paramValidation = idParamSchema.validate(request.params)
    if (paramValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: paramValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    const bodyValidation = updateCustomerSchema.validate(request.body, { abortEarly: false })
    if (bodyValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: bodyValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    await updateCustomerController.handle(request, reply)
  })

  app.patch('/customers/:id/status', async (request: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>, reply: FastifyReply) => {
    const paramValidation = idParamSchema.validate(request.params)
    if (paramValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: paramValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    const bodyValidation = updateCustomerStatusSchema.validate(request.body)
    if (bodyValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: bodyValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    await updateCustomerStatusController.handle(request, reply)
  })
}
