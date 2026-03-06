import { Logger } from 'typeorm'
import { LoggerService } from '../logger.service'
import { TypeormMeta, TypeOrmStackInfo } from './typeorm-logger.interface'

export class TypeormLogger implements Logger {
  constructor(private readonly loggerService: LoggerService) {}

  log(level: 'log' | 'info' | 'warn', message: any): void {
    const stackInfo = this.getStackInfo({ message })
    this.loggerService.debug('[TypeOrmLogger - log]', { meta: stackInfo })
  }

  logMigration(message: string): void {
    const stackInfo = this.getStackInfo({ message })
    this.loggerService.debug('[TypeOrmLogger - logMigration]', {
      meta: stackInfo
    })
  }

  logQuery<T>(query: string, parameters?: T[]): void {
    const stackInfo = this.getStackInfo({ query, parameters })
    this.loggerService.debug('[TypeOrmLogger - logQuery]', { meta: stackInfo })
  }

  logQueryError<T>(error: string, query: string, parameters?: T[]): void {
    const stackInfo = this.getStackInfo({ query, parameters })
    this.loggerService.err('[TypeOrmLogger - logQueryError]', {
      error,
      meta: stackInfo
    })
  }

  logQuerySlow<T>(time: number, query: string, parameters?: T[]): void {
    const stackInfo = this.getStackInfo({ query, parameters, time })
    this.loggerService.err('[TypeOrmLogger - logQuerySlow]', {
      meta: stackInfo
    })
  }

  logSchemaBuild(message: string): void {
    const stackInfo = this.getStackInfo({ message })
    this.loggerService.debug('[TypeOrmLogger - logSchemaBuild]', {
      meta: stackInfo
    })
  }

  getStackInfo(meta: TypeormMeta): TypeOrmStackInfo {
    return {
      query:
        meta?.query?.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ') ?? '',
      parameters: meta?.parameters?.length ? meta.parameters : '[]',
      time: meta?.time ?? 0,
      message: meta?.message ?? ''
    }
  }
}
