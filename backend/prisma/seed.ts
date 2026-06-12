import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const __dirname = dirname(fileURLToPath(import.meta.url))

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

interface MotoJson {
  id: string
  brand: string
  model: string
  registration: string
  category: string
  status: string
  currentKm: number
  pricePerDay: number
  description: string
  photos: string[]
  style: string
  year: number
  hp: number
  torque: number
  consumption: number
  range: number
}

async function main() {
  const raw = readFileSync(join(__dirname, '../../motos.json'), 'utf-8')
  const motos: MotoJson[] = JSON.parse(raw)

  const brandNames = [...new Set(motos.map((m) => m.brand))]
  const categoryNames = [...new Set(motos.map((m) => m.category))]
  const statusNames = [...new Set(motos.map((m) => m.status))]

  console.log(`Upsert ${brandNames.length} marques...`)
  const brandMap = new Map<string, string>()
  for (const name of brandNames) {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { id: uuidv4(), name },
    })
    brandMap.set(name, brand.id)
  }

  console.log(`Upsert ${categoryNames.length} catégories...`)
  const categoryMap = new Map<string, string>()
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: uuidv4(), name },
    })
    categoryMap.set(name, category.id)
  }

  console.log(`Upsert ${statusNames.length} statuts...`)
  const statusMap = new Map<string, string>()
  for (const name of statusNames) {
    const status = await prisma.status.upsert({
      where: { name },
      update: {},
      create: { id: uuidv4(), name },
    })
    statusMap.set(name, status.id)
  }

  console.log(`Import de ${motos.length} motos...`)
  let created = 0
  let skipped = 0

  for (const m of motos) {
    const existing = await prisma.moto.findUnique({ where: { registration: m.registration } })
    if (existing) {
      skipped++
      continue
    }

    const motoId = uuidv4()
    await prisma.moto.create({
      data: {
        id: motoId,
        brandId: brandMap.get(m.brand)!,
        model: m.model,
        serialNumber: `SN-${m.registration}`,
        registration: m.registration,
        categoryId: categoryMap.get(m.category)!,
        statusId: statusMap.get(m.status)!,
        currentKm: m.currentKm,
        pricePerDay: m.pricePerDay,
        description: m.description,
        style: m.style,
        year: m.year,
        hp: m.hp,
        torque: m.torque,
        consumption: m.consumption,
        range: m.range,
        images: {
          create: m.photos.map((url) => ({ id: uuidv4(), url })),
        },
      },
    })
    created++
  }

  console.log(`Done: ${created} motos créées, ${skipped} ignorées (déjà présentes).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
