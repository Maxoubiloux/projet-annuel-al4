import { FastifyInstance } from 'fastify'
import { motoroutesV1 } from './motos.routes'
import { shoproutesV1 } from './shops.routes'
import { brandroutesV1 } from './brands.routes'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { IShopRepository } from '@domain/repositories/IShopRepository'
import { IBrandRepository } from '@domain/repositories/IBrandRepository'

export default async function (
  fastify: FastifyInstance,
  opts: {
    motoRepository: IMotoRepository
    shopRepository: IShopRepository
    brandRepository: IBrandRepository
  },
) {
  await motoroutesV1(fastify, { motoRepository: opts.motoRepository })
  await shoproutesV1(fastify, { shopRepository: opts.shopRepository })
  await brandroutesV1(fastify, { brandRepository: opts.brandRepository })
}
