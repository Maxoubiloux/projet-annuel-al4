import pino from 'pino'

export class Logger {
  private logger = pino(
    process.env.NODE_ENV === 'production'
      ? {}
      : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
  )

  getPino() {
    return this.logger
  }

  info(msg: string, obj?: Record<string, unknown>) {
    this.logger.info(obj, msg)
  }

  error(msg: string, err?: Error, obj?: Record<string, unknown>) {
    this.logger.error({ ...obj, err }, msg)
  }

  warn(msg: string, obj?: Record<string, unknown>) {
    this.logger.warn(obj, msg)
  }

  debug(msg: string, obj?: Record<string, unknown>) {
    this.logger.debug(obj, msg)
  }

  child(bindings: Record<string, unknown>) {
    return this.logger.child(bindings)
  }
}
