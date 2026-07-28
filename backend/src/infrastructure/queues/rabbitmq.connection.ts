import { connect, type Channel } from 'amqplib'

// Robuste au renommage Connection -> ChannelModel entre versions d'amqplib.
type AmqpConnection = Awaited<ReturnType<typeof connect>>

export interface QueueLogger {
  info: (obj: object, msg?: string) => void
  warn: (obj: object, msg?: string) => void
  error: (obj: object, msg?: string) => void
}

export interface QueueConfig {
  url: string
  requestQueue: string
  responseQueue: string
  deadLetterQueue: string
  deadLetterExchange: string
}

/** Lit la configuration des files depuis l'environnement (défauts alignés sur
 *  worker/.env.example et docker-compose). */
export function loadQueueConfig(): QueueConfig {
  return {
    url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    requestQueue: process.env.REQUEST_QUEUE ?? 'worker_requests',
    responseQueue: process.env.RESPONSE_QUEUE ?? 'worker_responses',
    deadLetterQueue: process.env.DEAD_LETTER_QUEUE ?? 'worker_dead_letters',
    deadLetterExchange: process.env.DEAD_LETTER_EXCHANGE ?? 'worker_dlx',
  }
}

/**
 * Gère une connexion RabbitMQ unique + son canal, et déclare la topologie :
 * une dead-letter queue liée à un exchange dédié, et les files de demandes /
 * réponses configurées pour y router les messages rejetés (nack sans requeue).
 */
export class RabbitMqConnection {
  private connection: AmqpConnection | null = null
  private channel: Channel | null = null

  constructor(private readonly config: QueueConfig = loadQueueConfig()) {}

  getConfig(): QueueConfig {
    return this.config
  }

  /** Établit la connexion, le canal et déclare la topologie (idempotent). */
  async connect(logger?: QueueLogger): Promise<Channel> {
    if (this.channel) return this.channel

    const connection = await connect(this.config.url)
    // Écoute des events pour éviter qu'un 'error' non géré ne fasse crasher le
    // process après une coupure du broker (amqplib émet sur un EventEmitter).
    connection.on('error', (err: unknown) => {
      logger?.error({ err }, 'RabbitMQ connection error')
    })
    connection.on('close', () => {
      this.connection = null
      this.channel = null
      logger?.warn({}, 'RabbitMQ connection closed')
    })

    try {
      const channel = await connection.createChannel()

      // Dead lettering : exchange fanout -> DLQ.
      await channel.assertExchange(this.config.deadLetterExchange, 'fanout', { durable: true })
      await channel.assertQueue(this.config.deadLetterQueue, { durable: true })
      await channel.bindQueue(this.config.deadLetterQueue, this.config.deadLetterExchange, '')

      // Files métier : les messages rejetés (nack, requeue=false) partent en DLQ.
      const dlxOpts = { durable: true, deadLetterExchange: this.config.deadLetterExchange }
      await channel.assertQueue(this.config.requestQueue, dlxOpts)
      await channel.assertQueue(this.config.responseQueue, dlxOpts)

      this.connection = connection
      this.channel = channel
      return channel
    } catch (err) {
      // Évite une connexion TCP orpheline si la déclaration de topologie échoue.
      await connection.close().catch(() => {})
      throw err
    }
  }

  /** Retourne le canal courant ou lève si la connexion n'est pas établie. */
  requireChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialised — call connect() first')
    }
    return this.channel
  }

  async close(): Promise<void> {
    await this.channel?.close()
    await this.connection?.close()
    this.channel = null
    this.connection = null
  }
}
