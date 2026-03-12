import { LoggerService as NestLoggerService } from '@nestjs/common'
import { LoggerService } from './logger.service'

export class NestLoggerAdapter implements NestLoggerService {
  constructor(private readonly logger: LoggerService) {}

  log(message: unknown, ...optionalParams: unknown[]) {
    const { context } = this.extractContext(optionalParams)
    this.logger.info(String(message), context ? { context } : {})
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    const { context, params } = this.extractContext(optionalParams)
    const trace = typeof params[0] === 'string' ? params[0] : undefined
    const data: Record<string, unknown> = {}
    if (context) data.context = context
    if (trace) data.trace = trace
    this.logger.err(String(message), data)
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    const { context } = this.extractContext(optionalParams)
    this.logger.warn(String(message), context ? { context } : {})
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    const { context } = this.extractContext(optionalParams)
    this.logger.debug(String(message), context ? { context } : {})
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    const { context } = this.extractContext(optionalParams)
    this.logger.debug(String(message), context ? { context } : {})
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    const { context } = this.extractContext(optionalParams)
    this.logger.err(String(message), context ? { context } : {})
  }

  private extractContext(optionalParams: unknown[]): {
    context?: string
    params: unknown[]
  } {
    const params = [...optionalParams]
    let context: string | undefined
    if (params.length > 0 && typeof params[params.length - 1] === 'string') {
      context = params.pop() as string
    }
    return { context, params }
  }
}
