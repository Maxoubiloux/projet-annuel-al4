import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IBrandRepository } from '@domain/repositories/IBrandRepository'
import { CreateBrandParams, UpdateBrandParams } from '@domain/entities/Brand'
import { CreateBrandUseCase } from '@domain/usecases/create-brand.usecase'
import { GetAllBrandsUseCase } from '@domain/usecases/get-all-brands.usecase'
import { GetBrandByIdUseCase } from '@domain/usecases/get-brand-by-id.usecase'
import { UpdateBrandUseCase } from '@domain/usecases/update-brand.usecase'
import { DeleteBrandUseCase } from '@domain/usecases/delete-brand.usecase'
import { CreateBrandController } from '@presentation/controllers/create-brand.controller'
import { GetAllBrandsController } from '@presentation/controllers/get-all-brands.controller'
import { GetBrandByIdController } from '@presentation/controllers/get-brand-by-id.controller'
import { UpdateBrandController } from '@presentation/controllers/update-brand.controller'
import { DeleteBrandController } from '@presentation/controllers/delete-brand.controller'
import { createBrandSchema } from '@presentation/validators/create-brand.validator'
import { updateBrandSchema } from '@presentation/validators/update-brand.validator'
import { idParamSchema } from '@presentation/validators/id-param.validator'

export async function brandroutesV1(app: FastifyInstance, opts: { brandRepository: IBrandRepository }) {
  const repo = opts.brandRepository

  const getAllBrandsController = new GetAllBrandsController(new GetAllBrandsUseCase(repo))
  const getBrandByIdController = new GetBrandByIdController(new GetBrandByIdUseCase(repo))
  const createBrandController = new CreateBrandController(new CreateBrandUseCase(repo))
  const updateBrandController = new UpdateBrandController(new UpdateBrandUseCase(repo))
  const deleteBrandController = new DeleteBrandController(new DeleteBrandUseCase(repo))

  // GET /brands
  app.get('/brands', async (request: FastifyRequest, reply: FastifyReply) => {
    await getAllBrandsController.handle(request, reply)
  })

  // GET /brands/:id
  app.get('/brands/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await getBrandByIdController.handle(request, reply)
  })

  // POST /brands
  app.post('/brands', async (request: FastifyRequest<{ Body: CreateBrandParams }>, reply: FastifyReply) => {
    const { error } = createBrandSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await createBrandController.handle(request, reply)
  })

  // PUT /brands/:id
  app.put('/brands/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateBrandParams }>, reply: FastifyReply) => {
    const paramValidation = idParamSchema.validate(request.params)
    if (paramValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: paramValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    const bodyValidation = updateBrandSchema.validate(request.body, { abortEarly: false })
    if (bodyValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: bodyValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    await updateBrandController.handle(request, reply)
  })

  // DELETE /brands/:id
  app.delete('/brands/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await deleteBrandController.handle(request, reply)
  })
}
