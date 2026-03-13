export interface TypeormMeta {
  message?: string
  query?: string
  parameters?: unknown[]
  error?: Error
  time?: number
}

export interface TypeOrmStackInfo {
  query?: string
  message?: string
  parameters?: unknown[] | string
  error?: Error
  time?: number
}
