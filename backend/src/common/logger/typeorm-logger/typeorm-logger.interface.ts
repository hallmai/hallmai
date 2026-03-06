export interface TypeormMeta {
  message?: string
  query?: string
  parameters?: any
  error?: Error
  time?: number
}

export interface TypeOrmStackInfo {
  query?: string
  message?: string
  parameters?: any
  error?: Error
  time?: number
}
