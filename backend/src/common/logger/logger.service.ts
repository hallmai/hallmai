import { Inject, Injectable } from '@nestjs/common'
import type { Request } from 'express'
import type {
  ExpressRequestLogFormat,
  ExpressResponseLogFormat,
  LogData,
  LoggerModuleOptions
} from './logger.interface'
import { defaultExpressLogParserOptions } from './logger.interface'
import { MODULE_OPTIONS_TOKEN } from './logger.module-definition'
import { WinstonLogger } from './winston-logger'

@Injectable()
export class LoggerService {
  private readonly winstonLogger: WinstonLogger
  private readonly loggerModuleOptions: LoggerModuleOptions

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: LoggerModuleOptions
  ) {
    this.winstonLogger = new WinstonLogger(options.winstonLoggerOptions)
    this.loggerModuleOptions = Object.assign(
      defaultExpressLogParserOptions,
      options
    )
  }

  info(message: string, logData: LogData) {
    this.winstonLogger.logger.info({
      message,
      data: this.logDataFormat(logData)
    })
  }

  debug(message: string, logData: LogData) {
    this.winstonLogger.logger.debug({
      message,
      data: this.logDataFormat(logData)
    })
  }

  err(message: string, logData: LogData) {
    if (logData.err instanceof Error) {
      const { message, stack, ...without } = logData.err
      logData.err = { message, stack, ...without }
    }
    this.winstonLogger.logger.error({
      message,
      data: this.logDataFormat(logData)
    })
  }

  warn(message: string, logData: LogData) {
    this.winstonLogger.logger.warn({
      message,
      data: this.logDataFormat(logData)
    })
  }

  private filterParams(params: any): string {
    const { expressLogParserOptions } = this.loggerModuleOptions
    let str: string = ''
    switch (typeof params) {
      case 'string':
      case 'number':
      case 'bigint':
      case 'boolean':
      case 'function':
        str = params.toString()
        break
      case 'object':
        if (expressLogParserOptions.filterParameters.length !== 0) {
          str = JSON.stringify(params, (key, value) => {
            if (expressLogParserOptions.filterParameters.includes(key)) {
              return this.loggerModuleOptions.expressLogParserOptions
                .filteredValue
            } else {
              return value
            }
          })
        } else {
          str = JSON.stringify(params)
        }
        break
    }
    return str
  }

  logDataFormat(logData: LogData) {
    const { req, res, ...withoutRequestAndResponse } = logData
    return {
      req: req != null ? this.makeRequestLogData(req) : undefined,
      res:
        res != null
          ? this.makeResponseLogData(res.status, res.responseBody)
          : undefined,
      responseTime: res?.responseTime,
      ...withoutRequestAndResponse
    }
  }

  makeRequestLogData(req: Request): ExpressRequestLogFormat {
    let requestBody
    if (
      this.loggerModuleOptions.expressLogParserOptions.filterParameters
        .length !== 0
    ) {
      requestBody = this.filterParams(req.body)
      try {
        requestBody = JSON.parse(requestBody)
      } catch {}
    } else {
      requestBody = req.body
    }
    return {
      originalUrl: req.originalUrl,
      method: req.method,
      headers: req.headers,
      ip: req.ip ?? '',
      body: requestBody,
      query: req.query
    }
  }

  makeResponseLogData(
    status: number,
    responseBody: any
  ): ExpressResponseLogFormat {
    const { expressLogParserOptions } = this.loggerModuleOptions
    const bodyString = this.filterParams(responseBody)
    return {
      status,
      body:
        typeof expressLogParserOptions.maxResponseBodyLength === 'number'
          ? bodyString.substring(
              0,
              expressLogParserOptions.maxResponseBodyLength
            )
          : bodyString
    }
  }
}
