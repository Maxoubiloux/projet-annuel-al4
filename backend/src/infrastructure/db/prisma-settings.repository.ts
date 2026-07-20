import { ISettingsRepository } from '@domain/repositories/ISettingsRepository'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

export class PrismaSettingsRepository implements ISettingsRepository {
  async get(key: string): Promise<unknown | null> {
    const r = await prisma.setting.findUnique({ where: { key } })
    return r ? r.value : null
  }

  async set(key: string, value: unknown): Promise<unknown> {
    const r = await prisma.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    })
    return r.value
  }
}
