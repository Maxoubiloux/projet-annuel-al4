export abstract class DomainError extends Error {
  abstract readonly code: string

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, DomainError.prototype)
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR'
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND'
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED'
  constructor(message: string = 'Unauthorized') {
    super(message)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN'
  constructor(message: string = 'Forbidden') {
    super(message)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

export class InternalServerError extends DomainError {
  readonly code = 'INTERNAL_SERVER_ERROR'
  constructor(message: string = 'Internal Server Error') {
    super(message)
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}
