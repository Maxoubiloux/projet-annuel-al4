export type Result<T, E = Error> = Ok<T> | Err<E>

export class Ok<T> {
  readonly isOk = true
  readonly isErr = false

  constructor(readonly value: T) { }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return ok(fn(this.value))
  }

  mapErr<F>(): Result<T, F> {
    // Un Ok n'a pas d'erreur : il est déjà un Result<T, F> valide quel que soit F.
    return this as Result<T, F>
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
    // Un Err ne porte pas de valeur : il est déjà un Result<never, E> valide.
    return this as Result<never, E>
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
