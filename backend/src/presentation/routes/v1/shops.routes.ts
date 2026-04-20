import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IShopRepository } from '@domain/repositories/IShopRepository'
import { CreateShopParams, UpdateShopParams } from '@domain/entities/Shop'
import { CreateShopUseCase } from '@domain/usecases/create-shop.usecase'
import { GetAllShopsUseCase } from '@domain/usecases/get-all-shops.usecase'
import { GetShopByIdUseCase } from '@domain/usecases/get-shop-by-id.usecase'
import { UpdateShopUseCase } from '@domain/usecases/update-shop.usecase'
import { DeleteShopUseCase } from '@domain/usecases/delete-shop.usecase'
import { CreateShopController } from '@presentation/controllers/create-shop.controller'
import { GetAllShopsController } from '@presentation/controllers/get-all-shops.controller'
import { GetShopByIdController } from '@presentation/controllers/get-shop-by-id.controller'
import { UpdateShopController } from '@presentation/controllers/update-shop.controller'
import { DeleteShopController } from '@presentation/controllers/delete-shop.controller'
import { createShopSchema } from '@presentation/validators/create-shop.validator'
import { updateShopSchema } from '@presentation/validators/update-shop.validator'
import { idParamSchema } from '@presentation/validators/id-param.validator'

export async function shoproutesV1(app: FastifyInstance, opts: { shopRepository: IShopRepository }) {
  const repo = opts.shopRepository

  const getAllShopsController = new GetAllShopsController(new GetAllShopsUseCase(repo))
  const getShopByIdController = new GetShopByIdController(new GetShopByIdUseCase(repo))
  const createShopController = new CreateShopController(new CreateShopUseCase(repo))
  const updateShopController = new UpdateShopController(new UpdateShopUseCase(repo))
  const deleteShopController = new DeleteShopController(new DeleteShopUseCase(repo))

  // GET /shops
  app.get('/shops', async (request: FastifyRequest, reply: FastifyReply) => {
    await getAllShopsController.handle(request, reply)
  })

  // GET /shops/:id
  app.get('/shops/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await getShopByIdController.handle(request, reply)
  })

  // POST /shops
  app.post('/shops', async (request: FastifyRequest<{ Body: CreateShopParams }>, reply: FastifyReply) => {
    const { error } = createShopSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await createShopController.handle(request, reply)
  })

  // PUT /shops/:id
  app.put('/shops/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateShopParams }>, reply: FastifyReply) => {
    const paramValidation = idParamSchema.validate(request.params)
    if (paramValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: paramValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    const bodyValidation = updateShopSchema.validate(request.body, { abortEarly: false })
    if (bodyValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: bodyValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    await updateShopController.handle(request, reply)
  })

  // DELETE /shops/:id
  app.delete('/shops/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await deleteShopController.handle(request, reply)
  })
}
