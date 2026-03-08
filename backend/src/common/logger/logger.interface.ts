import { Request } from 'express'
import { IncomingHttpHeaders } from 'http'
import { ParsedQs } from 'qs'
import { WinstonLoggerOptions } from './winston-logger/winston-logger.interface'

export interface LoggerModuleOptions {
  expressLogParserOptions: ExpressLogParserOptions
  winstonLoggerOptions: WinstonLoggerOptions
}

export interface ExpressLogParserOptions {
  filteredValue: string
  filterParameters: string[]
  maxResponseBodyLength?: false | number
}

export const defaultExpressLogParserOptions: Partial<ExpressLogParserOptions> =
  {
    maxResponseBodyLength: false
  }

export interface LogData {
  req?: Request
  res?: {
    status: number
    responseBody: unknown
    responseTime: number
  }
  [key: string]: unknown
}

export interface ExpressRequestLogFormat {
  originalUrl: string
  method: string
  headers: IncomingHttpHeaders
  body: unknown
  ip: string
  query: ParsedQs
}

export interface ExpressResponseLogFormat {
  status: number
  body: string
}
