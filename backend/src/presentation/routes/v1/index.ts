import { FastifyInstance } from 'fastify'
import { motoroutesV1 } from './motos.routes'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'

export default async function (fastify: FastifyInstance, opts: { motoRepository: IMotoRepository }) {
  await motoroutesV1(fastify, { motoRepository: opts.motoRepository })
}
