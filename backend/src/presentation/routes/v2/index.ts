import { FastifyInstance } from 'fastify'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { motoRoutesV2 } from './motos.routes'

export default async function (
  fastify: FastifyInstance,
  opts: { motoRepository: IMotoRepository },
) {
  await motoRoutesV2(fastify, { motoRepository: opts.motoRepository })
}
