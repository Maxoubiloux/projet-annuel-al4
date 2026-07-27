import { FastifyInstance } from 'fastify'
import { motoroutesV1 } from './motos.routes'
import { shoproutesV1 } from './shops.routes'
import { brandroutesV1 } from './brands.routes'
import { reservationRoutesV1 } from './reservations.routes'
import { customerRoutesV1 } from './customers.routes'
import { maintenanceRoutesV1 } from './maintenance.routes'
import { paymentRoutesV1 } from './payments.routes'
import { settingsRoutesV1 } from './settings.routes'
import { dashboardRoutesV1 } from './dashboard.routes'
import { authRoutesV1 } from './auth.routes'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { IShopRepository } from '@domain/repositories/IShopRepository'
import { IBrandRepository } from '@domain/repositories/IBrandRepository'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository'
import { IMaintenanceRepository } from '@domain/repositories/IMaintenanceRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { ISettingsRepository } from '@domain/repositories/ISettingsRepository'
import { IDashboardRepository } from '@domain/repositories/IDashboardRepository'
import { IIamClient } from '@domain/repositories/IIamClient'
import { IContractQueuePublisher } from '@domain/ports/IContractQueuePublisher'

export default async function (
  fastify: FastifyInstance,
  opts: {
    motoRepository: IMotoRepository
    shopRepository: IShopRepository
    brandRepository: IBrandRepository
    reservationRepository: IReservationRepository
    customerRepository: ICustomerRepository
    maintenanceRepository: IMaintenanceRepository
    paymentRepository: IPaymentRepository
    settingsRepository: ISettingsRepository
    dashboardRepository: IDashboardRepository
    iamClient: IIamClient
    contractPublisher?: IContractQueuePublisher
  },
) {
  await motoroutesV1(fastify, { motoRepository: opts.motoRepository })
  await shoproutesV1(fastify, { shopRepository: opts.shopRepository })
  await brandroutesV1(fastify, { brandRepository: opts.brandRepository })
  await reservationRoutesV1(fastify, {
    reservationRepository: opts.reservationRepository,
    paymentRepository: opts.paymentRepository,
    contractPublisher: opts.contractPublisher,
  })
  await customerRoutesV1(fastify, { customerRepository: opts.customerRepository })
  await maintenanceRoutesV1(fastify, { maintenanceRepository: opts.maintenanceRepository })
  await paymentRoutesV1(fastify, { paymentRepository: opts.paymentRepository })
  await settingsRoutesV1(fastify, { settingsRepository: opts.settingsRepository })
  await dashboardRoutesV1(fastify, { dashboardRepository: opts.dashboardRepository })
  await authRoutesV1(fastify, { iamClient: opts.iamClient })
}
