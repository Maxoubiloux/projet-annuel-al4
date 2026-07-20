import { randomUUID } from 'crypto'
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { CreateMotoParams, UpdateMotoParams } from '@domain/entities/Moto'
import { CreateMotoUseCase } from '@domain/usecases/create-moto.usecase'
import { GetAllMotosUseCase } from '@domain/usecases/get-all-motos.usecase'
import { GetMotoByIdUseCase } from '@domain/usecases/get-moto-by-id.usecase'
import { UpdateMotoUseCase } from '@domain/usecases/update-moto.usecase'
import { DeleteMotoUseCase } from '@domain/usecases/delete-moto.usecase'
import { CreateMotoController } from '@presentation/controllers/create-moto.controller'
import { GetAllMotosController } from '@presentation/controllers/get-all-motos.controller'
import { GetMotoByIdController } from '@presentation/controllers/get-moto-by-id.controller'
import { UpdateMotoController } from '@presentation/controllers/update-moto.controller'
import { DeleteMotoController } from '@presentation/controllers/delete-moto.controller'
import { createMotoSchema } from '@presentation/validators/create-moto.validator'
import { updateMotoSchema } from '@presentation/validators/update-moto.validator'
import { idParamSchema } from '@presentation/validators/id-param.validator'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'motos')

const ALLOWED_IMAGE_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

export async function motoroutesV1(app: FastifyInstance, opts: { motoRepository: IMotoRepository }) {
  const repo = opts.motoRepository

  const getAllMotosController = new GetAllMotosController(new GetAllMotosUseCase(repo))
  const getMotoByIdController = new GetMotoByIdController(new GetMotoByIdUseCase(repo))
  const createMotoController = new CreateMotoController(new CreateMotoUseCase(repo))
  const updateMotoController = new UpdateMotoController(new UpdateMotoUseCase(repo))
  const deleteMotoController = new DeleteMotoController(new DeleteMotoUseCase(repo))

  app.get('/motos', async (request: FastifyRequest, reply: FastifyReply) => {
    await getAllMotosController.handle(request, reply)
  })

  app.get('/motos/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await getMotoByIdController.handle(request, reply)
  })

  app.post('/motos/upload-image', async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file()
    if (!file) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file provided' },
      })
      return
    }

    const ext = ALLOWED_IMAGE_EXT[file.mimetype]
    if (!ext) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'File must be a JPEG, PNG, WebP or GIF image' },
      })
      return
    }

    await mkdir(UPLOAD_DIR, { recursive: true })
    const filename = `${randomUUID()}${ext}`
    await pipeline(file.file, createWriteStream(join(UPLOAD_DIR, filename)))

    const origin = `${request.protocol}://${request.headers.host}`
    reply.send({ success: true, data: { url: `${origin}/uploads/motos/${filename}` } })
  })

  app.post('/motos', async (request: FastifyRequest<{ Body: CreateMotoParams }>, reply: FastifyReply) => {
    const { error } = createMotoSchema.validate(request.body, { abortEarly: false })
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await createMotoController.handle(request, reply)
  })

  app.put('/motos/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateMotoParams }>, reply: FastifyReply) => {
    const paramValidation = idParamSchema.validate(request.params)
    if (paramValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: paramValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    const bodyValidation = updateMotoSchema.validate(request.body, { abortEarly: false })
    if (bodyValidation.error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: bodyValidation.error.details.map(d => d.message).join(', ') },
      })
      return
    }

    await updateMotoController.handle(request, reply)
  })

  app.delete('/motos/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await deleteMotoController.handle(request, reply)
  })
}
