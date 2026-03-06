import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  SetMetadata
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request, Response } from 'express'
import { map, Observable } from 'rxjs'
import type { LogData } from '../logger/logger.interface'
import { LoggerService } from '../logger/logger.service'

export const IGNORE_RESPONSE_INTERCEPTOR = 'IGNORE_RESPONSE_INTERCEPTOR'
export const IGNORE_LOGGING = 'IGNORE_LOGGING'

export const IgnoreResponseInterceptor = () =>
  SetMetadata(IGNORE_RESPONSE_INTERCEPTOR, true)

export const IgnoreLogging = () => SetMetadata(IGNORE_LOGGING, true)

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly loggerService: LoggerService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isIgnoreResponse =
      this.reflector.get<boolean>(
        IGNORE_RESPONSE_INTERCEPTOR,
        context.getHandler()
      ) ??
      this.reflector.get<boolean>(
        IGNORE_RESPONSE_INTERCEPTOR,
        context.getClass()
      )

    const isIgnoreLogging =
      this.reflector.get<boolean>(IGNORE_LOGGING, context.getHandler()) ??
      this.reflector.get<boolean>(IGNORE_LOGGING, context.getClass())

    switch (context.getType()) {
      case 'http':
        return this.handleHttp(
          context,
          next,
          isIgnoreResponse,
          isIgnoreLogging
        )
      default:
        return next.handle()
    }
  }

  private handleHttp(
    context: ExecutionContext,
    next: CallHandler,
    isIgnoreResponse: boolean,
    isIgnoreLogging: boolean
  ) {
    const host = context.switchToHttp()
    const req = host.getRequest<Request>()
    const res = host.getResponse<Response>()

    const startTime = Date.now()
    const originalSend = res.send
    res.send = (responseBody: any) => {
      const status = res.statusCode
      const message = `${req.method} ${req.url}`
      const error = res.locals['error']
      const logData: LogData = {
        req,
        res: {
          status,
          responseBody,
          responseTime: Date.now() - startTime
        }
      }
      if (error != null) {
        logData['err'] = { stack: error.stack, error }
      }

      if (!isIgnoreLogging) {
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
          this.loggerService.err(message, logData)
        } else if (status >= HttpStatus.BAD_REQUEST) {
          this.loggerService.warn(message, logData)
        } else {
          this.loggerService.info(message, logData)
        }
      }
      res.send = originalSend
      return res.send(responseBody)
    }

    return next.handle().pipe(
      map((body) => {
        if (isIgnoreResponse) {
          return body
        }
        if (res.statusCode === HttpStatus.CREATED) {
          res.statusCode = HttpStatus.OK
        }
        return { data: body }
      })
    )
  }
}
