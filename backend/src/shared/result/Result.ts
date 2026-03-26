export type Result<T, E = Error> = Ok<T> | Err<E>

export class Ok<T> {
  readonly isOk = true
  readonly isErr = false

  constructor(readonly value: T) { }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return ok(fn(this.value))
  }

  mapErr<F>(): Result<T, F> {
    return this as any
  }

  getOr(): T {
    return this.value
  }
}

export class Err<E> {
  readonly isOk = false
  readonly isErr = true

  constructor(readonly error: E) { }

  map(): Result<never, E> {
    return this as any
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return err(fn(this.error))
  }

  getOr<T>(defaultValue: T): T {
    return defaultValue
  }
}

export function ok<T>(value: T): Result<T, never> {
  return new Ok(value)
}

export function err<E>(error: E): Result<never, E> {
  return new Err(error)
}
