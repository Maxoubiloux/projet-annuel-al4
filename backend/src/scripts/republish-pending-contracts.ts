/**
 * Republie une demande de génération de contrat PDF pour les réservations
 * payées dont le contrat n'a jamais abouti (typiquement : bloquées sur
 * l'état par défaut faute de worker/RabbitMQ en prod avant leur déploiement).
 *
 * Usage (depuis le conteneur backend, une fois worker + rabbitmq up) :
 *   node dist/scripts/republish-pending-contracts.js
 *   node dist/scripts/republish-pending-contracts.js --include-failed
 */
import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@infrastructure/db/prisma.client'
import { PrismaReservationRepository } from '@infrastructure/db/prisma-reservation.repository'
import { RabbitMqConnection } from '@infrastructure/queues/rabbitmq.connection'
import { RabbitMqContractPublisher } from '@infrastructure/queues/rabbitmq-contract.publisher'

const includeFailed = process.argv.includes('--include-failed')
const contractStatuses = includeFailed ? ['pending', 'failed'] : ['pending']

async function main(): Promise<void> {
  const candidates = await prisma.booking.findMany({
    where: { paymentStatus: 'paid', contractStatus: { in: contractStatuses } },
    select: { id: true },
  })

  if (candidates.length === 0) {
    console.warn(`Aucune réservation payée avec contrat ${contractStatuses.join('/')}.`)
    return
  }

  console.warn(`${candidates.length} réservation(s) à republier (${contractStatuses.join('/')}).`)

  const reservationRepository = new PrismaReservationRepository()
  const connection = new RabbitMqConnection()
  await connection.connect(console)
  const publisher = new RabbitMqContractPublisher(connection)

  let success = 0
  for (const { id } of candidates) {
    const reservation = await reservationRepository.findById(id)
    if (!reservation) continue

    try {
      await publisher.publishContractGeneration({
        correlationId: `republish-${uuidv4()}`,
        reservation: {
          id: reservation.id,
          motoId: reservation.motoId,
          customerId: reservation.customerId,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          totalAmount: reservation.totalAmount,
          depositAmount: reservation.depositAmount,
          customer: reservation.customer,
          moto: reservation.moto,
          shop: reservation.shop,
        },
      })
      // Évite qu'un re-run avant la réponse du worker ne republie en double.
      await reservationRepository.updateContract(id, 'processing', null)
      success++
      console.warn(`  ✓ ${id}`)
    } catch (err) {
      console.error(`  ✗ ${id}: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.warn(`${success}/${candidates.length} republié(s) sur worker_requests.`)

  await connection.close()
}

main()
  .catch((err) => {
    console.error('Échec du script :', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
