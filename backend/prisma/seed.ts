import 'dotenv/config'
import { PrismaClient, Prisma } from '../src/generated/prisma/client'
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
  const raw = readFileSync(join(__dirname, '../motos.json'), 'utf-8')
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

  console.log('Upsert des paramètres par défaut...')
  const defaultSettings: Record<string, Prisma.InputJsonValue> = {
    booking_rules: { minDays: 1, maxDays: 30, minAge: 21, freeCancelHours: 48 },
    company_info: {
      name: 'Plein Gaz Loc',
      address: '12 Rue des Motards, 75011 Paris',
      email: 'contact@pleingazloc.fr',
      phone: '+33 1 42 00 00 00',
    },
    preferences: { emailNotifications: true },
  }
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    })
  }

  console.log('Upsert du shop par défaut...')
  const shop =
    (await prisma.shop.findFirst()) ??
    (await prisma.shop.create({
      data: {
        id: uuidv4(),
        name: 'Plein Gaz Loc',
        address: '12 Rue des Motards',
        city: 'Paris',
        zipCode: '75011',
        country: 'France',
        phone: '+33142000000',
        email: 'contact@pleingazloc.fr',
      },
    }))

  console.log('Upsert des statuts moto (available/reserved/maintenance/inactive)...')
  const motoStatusMap = new Map<string, string>()
  for (const name of ['available', 'reserved', 'maintenance', 'inactive']) {
    const status = await prisma.status.upsert({
      where: { name },
      update: {},
      create: { id: uuidv4(), name },
    })
    motoStatusMap.set(name, status.id)
  }

  const allMotos = await prisma.moto.findMany()

  const customerCount = await prisma.user.count()
  if (customerCount === 0) {
    console.log('Création des clients de démo...')
    const firstNames = [
      'Lucas', 'Emma', 'Louis', 'Jade', 'Hugo', 'Alice', 'Léo', 'Chloé', 'Gabriel', 'Manon',
      'Arthur', 'Camille', 'Jules', 'Sarah', 'Adam', 'Léa', 'Raphaël', 'Inès', 'Nathan', 'Zoé',
    ]
    const lastNames = [
      'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand',
      'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David',
      'Bertrand', 'Roux', 'Vincent', 'Fournier',
    ]

    const customers = firstNames.map((firstName, i) => {
      const lastName = lastNames[i]
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
      return {
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email,
        password: uuidv4(),
        firstName,
        lastName,
        phone: `+336${String(10000000 + i * 137).slice(0, 8)}`,
        licenseNumber: `LIC-${(2024 - (i % 6)).toString()}-${String(1000 + i).padStart(4, '0')}`,
        licenseVerified: i % 5 !== 0,
        status: i % 9 === 0 ? 'suspended' : 'active',
      }
    })

    for (const c of customers) {
      await prisma.user.create({ data: c })
    }
  }

  const customers = await prisma.user.findMany()

  const bookingCount = await prisma.booking.count()
  if (bookingCount === 0 && allMotos.length > 0 && customers.length > 0) {
    console.log('Création des réservations et paiements de démo...')

    const now = new Date()
    const dayMs = 86_400_000
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const today = startOfDay(now)

    let seed = 42
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]

    const reservedMotoIds = new Set<string>()

    const totalBookings = 90
    for (let i = 0; i < totalBookings; i++) {
      const moto = pick(allMotos)
      const customer = pick(customers)

      // Cohorte garantie : ~78% passées (12 derniers mois), ~10% en cours, ~12% à venir
      const bucketRoll = rand()
      let startDate: Date
      let durationDays: number

      if (bucketRoll < 0.78) {
        const daysAgo = 1 + Math.floor(rand() * 365)
        startDate = new Date(today.getTime() - daysAgo * dayMs)
        durationDays = 1 + Math.floor(rand() * 10)
      } else if (bucketRoll < 0.88) {
        const daysAgo = Math.floor(rand() * 6)
        startDate = new Date(today.getTime() - daysAgo * dayMs)
        durationDays = daysAgo + 1 + Math.floor(rand() * 5)
      } else {
        const daysAhead = 1 + Math.floor(rand() * 20)
        startDate = new Date(today.getTime() + daysAhead * dayMs)
        durationDays = 1 + Math.floor(rand() * 10)
      }

      const endDate = new Date(startDate.getTime() + durationDays * dayMs)

      let status: string
      let paymentStatus: string
      if (endDate < today) {
        const roll = rand()
        status = roll < 0.85 ? 'completed' : 'cancelled'
        paymentStatus = status === 'cancelled' ? (rand() < 0.5 ? 'refunded' : 'pending') : 'paid'
      } else if (startDate <= today && endDate >= today) {
        status = 'in_progress'
        paymentStatus = 'paid'
        reservedMotoIds.add(moto.id)
      } else {
        status = rand() < 0.6 ? 'confirmed' : 'pending'
        paymentStatus = status === 'confirmed' ? 'paid' : 'pending'
      }

      const totalAmount = Math.round(moto.pricePerDay * durationDays)
      const depositAmount = moto.deposit > 0 ? moto.deposit : 150

      const booking = await prisma.booking.create({
        data: {
          id: uuidv4(),
          motoId: moto.id,
          userId: customer.id,
          shopId: shop.id,
          startDate,
          endDate,
          status,
          paymentStatus,
          totalAmount,
          depositAmount,
          createdAt: new Date(startDate.getTime() - 2 * dayMs),
        },
      })

      if (paymentStatus !== 'pending' || rand() < 0.3) {
        await prisma.payment.create({
          data: {
            id: uuidv4(),
            ref: `PAY-${booking.id.slice(0, 8).toUpperCase()}`,
            bookingId: booking.id,
            customerId: customer.id,
            amount: totalAmount,
            deposit: depositAmount,
            method: pick(['card', 'card', 'card', 'transfer', 'cash']),
            date: booking.createdAt,
            status: paymentStatus === 'cancelled' ? 'refunded' : paymentStatus,
          },
        })
      }
    }

    if (reservedMotoIds.size > 0) {
      await prisma.moto.updateMany({
        where: { id: { in: [...reservedMotoIds] } },
        data: { statusId: motoStatusMap.get('reserved')! },
      })
    }
  }

  const maintenanceCount = await prisma.maintenanceJob.count()
  if (maintenanceCount === 0 && allMotos.length > 0) {
    console.log('Création des interventions de maintenance de démo...')

    const jobTypes = ['Vidange', 'Révision complète', 'Changement pneus', 'Freins', 'Chaîne / transmission', 'Contrôle technique']
    let seed = 7
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
    const now = new Date()
    const dayMs = 86_400_000

    const maintenanceMotoIds = new Set<string>()

    for (let i = 0; i < 15; i++) {
      const moto = pick(allMotos)
      const daysOffset = Math.floor(rand() * 60) - 30
      const date = new Date(now.getTime() + daysOffset * dayMs)
      const sev = pick(['ok', 'ok', 'warning', 'warning', 'critical'])
      const status = date < now ? 'completed' : pick(['scheduled', 'open'])

      if (status !== 'completed' && sev === 'critical') {
        maintenanceMotoIds.add(moto.id)
      }

      await prisma.maintenanceJob.create({
        data: {
          id: uuidv4(),
          motoId: moto.id,
          type: pick(jobTypes),
          date,
          km: String(moto.currentKm + Math.floor(rand() * 2000)),
          cost: status === 'completed' ? Math.round(50 + rand() * 400) : 0,
          sev,
          status,
          notes: status === 'completed' ? 'Intervention réalisée en atelier.' : undefined,
          createdAt: new Date(date.getTime() - dayMs),
        },
      })
    }

    if (maintenanceMotoIds.size > 0) {
      await prisma.moto.updateMany({
        where: { id: { in: [...maintenanceMotoIds] } },
        data: { statusId: motoStatusMap.get('maintenance')! },
      })
    }
  }

  console.log('Passage des motos restantes en "available"...')
  await prisma.moto.updateMany({
    where: {
      statusId: {
        notIn: [
          motoStatusMap.get('reserved')!,
          motoStatusMap.get('maintenance')!,
          motoStatusMap.get('inactive')!,
        ],
      },
    },
    data: { statusId: motoStatusMap.get('available')! },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
