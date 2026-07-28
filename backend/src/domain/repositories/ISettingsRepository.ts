export interface ISettingsRepository {
  get(key: string): Promise<unknown | null>
  set(key: string, value: unknown): Promise<unknown>
}
