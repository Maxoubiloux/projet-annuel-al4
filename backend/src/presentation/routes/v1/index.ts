import { FastifyInstance } from 'fastify'
import { motoroutesV1 } from './motos.routes'
import { shoproutesV1 } from './shops.routes'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { IShopRepository } from '@domain/repositories/IShopRepository'

export default async function (fastify: FastifyInstance, opts: { motoRepository: IMotoRepository; shopRepository: IShopRepository }) {
  await motoroutesV1(fastify, { motoRepository: opts.motoRepository })
  await shoproutesV1(fastify, { shopRepository: opts.shopRepository })
}
