import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import {
  errorHandler,
  notFoundHandler,
  mapDomainErrorToStatus,
} from '@presentation/middleware/error-handler'
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from '@shared/errors/DomainError'

interface SentResponse {
  status: number
  body: unknown
}

// Fabrique une reply Fastify minimale qui capture status/send.
function makeReply(): { reply: FastifyReply; sent: () => SentResponse } {
  let capturedStatus = 200
  let capturedBody: unknown
  const reply = {
    status(code: number) {
      capturedStatus = code
      return this
    },
    send(body: unknown) {
      capturedBody = body
      return this
    },
  } as unknown as FastifyReply
  return { reply, sent: () => ({ status: capturedStatus, body: capturedBody }) }
}

function makeRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    id: 'test-correlation-id',
    method: 'GET',
    url: '/api/v1/motos/abc',
    log: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
    ...overrides,
  } as unknown as FastifyRequest
}

describe('mapDomainErrorToStatus', () => {
  it('maps ValidationError to 400', () => {
    expect(mapDomainErrorToStatus(new ValidationError('bad'))).toBe(400)
  })

  it('maps NotFoundError to 404', () => {
    expect(mapDomainErrorToStatus(new NotFoundError('Moto', 'abc'))).toBe(404)
  })

  it('maps UnauthorizedError to 401', () => {
    expect(mapDomainErrorToStatus(new UnauthorizedError())).toBe(401)
  })

  it('maps ForbiddenError to 403', () => {
    expect(mapDomainErrorToStatus(new ForbiddenError())).toBe(403)
  })

  it('maps InternalServerError to 500', () => {
    expect(mapDomainErrorToStatus(new InternalServerError())).toBe(500)
  })
})

describe('errorHandler', () => {
  it('returns the standard envelope with the mapped status for a domain error', () => {
    const { reply, sent } = makeReply()
    errorHandler(new NotFoundError('Moto', 'abc') as unknown as FastifyError, makeRequest(), reply)

    const { status, body } = sent()
    expect(status).toBe(404)
    expect(body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Moto with id abc not found' },
    })
  })

  it('maps a Fastify validation error to 400 VALIDATION_ERROR', () => {
    const { reply, sent } = makeReply()
    const validationError = {
      validation: [{ message: 'must be string' }],
      message: 'body/name must be string',
    } as unknown as FastifyError
    errorHandler(validationError, makeRequest(), reply)

    const { status, body } = sent()
    expect(status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'body/name must be string' },
    })
  })

  it('preserves explicit client-side statusCode (<500) carried by Fastify errors', () => {
    const { reply, sent } = makeReply()
    const httpError = {
      statusCode: 401,
      code: 'FST_JWT',
      message: 'token missing',
    } as unknown as FastifyError
    errorHandler(httpError, makeRequest(), reply)

    const { status, body } = sent()
    expect(status).toBe(401)
    expect(body).toEqual({
      success: false,
      error: { code: 'FST_JWT', message: 'token missing' },
    })
  })

  it('falls back to a leak-free 500 for an unexpected technical error', () => {
    const { reply, sent } = makeReply()
    const boom = new Error('DB password is hunter2') as unknown as FastifyError
    errorHandler(boom, makeRequest(), reply)

    const { status, body } = sent()
    expect(status).toBe(500)
    expect(body).toEqual({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' },
    })
    // Le message interne ne doit jamais fuiter dans la réponse.
    expect(JSON.stringify(body)).not.toContain('hunter2')
  })

  it('never leaks a custom InternalServerError message (500 stays generic)', () => {
    const { reply, sent } = makeReply()
    errorHandler(
      new InternalServerError('connection to 10.0.0.5:5432 refused') as unknown as FastifyError,
      makeRequest(),
      reply,
    )

    const { status, body } = sent()
    expect(status).toBe(500)
    expect(body).toEqual({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' },
    })
    expect(JSON.stringify(body)).not.toContain('10.0.0.5')
  })

  it('logs 5xx at error level with the correlation id', () => {
    const { reply } = makeReply()
    const request = makeRequest()
    errorHandler(new InternalServerError() as unknown as FastifyError, request, reply)
    expect(request.log.error).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'test-correlation-id' }),
      expect.any(String),
    )
    expect(request.log.warn).not.toHaveBeenCalled()
  })

  it('logs client 4xx at warn level, not error', () => {
    const { reply } = makeReply()
    const request = makeRequest()
    errorHandler(new NotFoundError('Moto', 'abc') as unknown as FastifyError, request, reply)
    expect(request.log.warn).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'test-correlation-id' }),
      expect.any(String),
    )
    expect(request.log.error).not.toHaveBeenCalled()
  })

  it('does nothing when the reply has already been sent', () => {
    let statusCalled = false
    const reply = {
      sent: true,
      status() {
        statusCalled = true
        return this
      },
      send() {
        return this
      },
    } as unknown as FastifyReply
    errorHandler(new InternalServerError() as unknown as FastifyError, makeRequest(), reply)
    expect(statusCalled).toBe(false)
  })
})

describe('notFoundHandler', () => {
  it('returns a 404 envelope describing the missing route', () => {
    const { reply, sent } = makeReply()
    notFoundHandler(makeRequest({ method: 'POST', url: '/api/v1/unknown' } as Partial<FastifyRequest>), reply)

    const { status, body } = sent()
    expect(status).toBe(404)
    expect(body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route POST /api/v1/unknown introuvable' },
    })
  })
})
