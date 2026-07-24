import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { RabbitMqConnection, QueueLogger } from './rabbitmq.connection'
import { parseContractJobResponse } from './messages'

export interface HandlerResult {
  /** true -> ack ; false -> nack (toujours sans requeue -> DLQ, voir plus bas). */
  ack: boolean
}

/**
 * Traitement pur d'une réponse du worker (testable sans RabbitMQ).
 * - message invalide  -> nack -> DLQ
 * - succès            -> contractStatus=ready + url, ack
 * - échec worker      -> contractStatus=failed, ack (l'échec métier est acté)
 * - erreur repository -> nack -> DLQ (pas de requeue : on évite toute boucle de
 *   redelivery infinie ; le message est isolé pour inspection. Une politique de
 *   retry bornée par criticité est prévue côté worker, cf. P2 du plan).
 */
export async function handleContractResponse(
  raw: unknown,
  reservationRepository: IReservationRepository,
): Promise<HandlerResult> {
  const parsed = parseContractJobResponse(raw)
  if (!parsed) {
    return { ack: false }
  }

  try {
    if (parsed.success) {
      await reservationRepository.updateContract(parsed.reservation_id, 'ready', parsed.url ?? null)
    } else {
      await reservationRepository.updateContract(parsed.reservation_id, 'failed', null)
    }
    return { ack: true }
  } catch {
    return { ack: false }
  }
}

/**
 * Démarre la consommation de la file de réponses worker -> backend et met à
 * jour l'état du contrat de la réservation concernée.
 */
export async function startWorkerResponseConsumer(
  connection: RabbitMqConnection,
  reservationRepository: IReservationRepository,
  logger?: QueueLogger,
): Promise<void> {
  const channel = connection.requireChannel()
  const { responseQueue } = connection.getConfig()

  // Un seul message non-acké à la fois : évite de noyer la DB et borne la charge.
  await channel.prefetch(1)

  await channel.consume(responseQueue, async (msg) => {
    if (!msg) return

    let raw: unknown
    try {
      raw = JSON.parse(msg.content.toString())
    } catch {
      logger?.warn({ queue: responseQueue }, 'Invalid JSON on worker response queue -> DLQ')
      channel.nack(msg, false, false)
      return
    }

    const correlationId =
      (raw as { correlation_id?: string })?.correlation_id ?? msg.properties.correlationId
    const result = await handleContractResponse(raw, reservationRepository)
    if (result.ack) {
      logger?.info({ correlationId }, 'Worker contract response processed')
      channel.ack(msg)
    } else {
      // Toujours sans requeue : message invalide ou échec de MAJ -> DLQ.
      logger?.warn({ correlationId }, 'Worker contract response rejected -> DLQ')
      channel.nack(msg, false, false)
    }
  })

  logger?.info({ queue: responseQueue }, 'Listening for worker contract responses')
}
