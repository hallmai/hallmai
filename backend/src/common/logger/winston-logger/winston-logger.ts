import { formatISO } from 'date-fns'
import * as logform from 'logform'
import { TransformableInfo } from 'logform'
import { inspect } from 'util'
import * as winston from 'winston'
import { WinstonLoggerOptions } from './winston-logger.interface'

export class WinstonLogger {
  logger: winston.Logger

  constructor(winstonLoggerOptions: WinstonLoggerOptions) {
    this.logger = winston.createLogger({
      defaultMeta: winstonLoggerOptions.assignedFormat
    })

    const logFormat = winston.format((info: TransformableInfo) => {
      delete info.timestamp
      return info
    })

    const logFormatDateTime = winston.format.timestamp({
      format: () => formatISO(new Date()),
      alias: 'datetime'
    })

    let format: logform.Format
    if (winstonLoggerOptions.isDebugMode) {
      format = winston.format.combine(
        logFormatDateTime,
        winston.format.colorize(),
        logFormat(),
        winston.format.printf((info: TransformableInfo) => {
          return `${info.datetime} ${info.level}: ${inspect(
            {
              message: info.message,
              data: info.data
            },
            { breakLength: Infinity, depth: 10, colors: true }
          )}`
        })
      )
    } else {
      format = winston.format.combine(
        logFormatDateTime,
        logFormat(),
        winston.format.json()
      )
    }

    this.logger.add(
      new winston.transports.Console({
        level: winstonLoggerOptions.level,
        format
      })
    )
  }
}
