import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { Response } from 'express'
import { ErrorCode } from './error-code.enum'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let errorCode = ErrorCode.INTERNAL_ERROR
    let message = 'Internal server error'

    let extra: Record<string, unknown> = {}

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exResponse = exception.getResponse()

      if (typeof exResponse === 'object' && exResponse !== null) {
        const {
          message: msg,
          errorCode: code,
          ...rest
        } = exResponse as Record<string, unknown>
        message = (msg as string) || exception.message
        errorCode = (code as ErrorCode) || this.mapStatusToErrorCode(status)
        extra = rest
      } else {
        message = exResponse
        errorCode = this.mapStatusToErrorCode(status)
      }
    } else if (exception instanceof Error) {
      message = exception.message
    }

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      ...extra
    })
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 400:
        return ErrorCode.VALIDATION
      case 401:
        return ErrorCode.UNAUTHORIZED
      case 403:
        return ErrorCode.FORBIDDEN
      case 404:
        return ErrorCode.NOT_FOUND
      default:
        return ErrorCode.INTERNAL_ERROR
    }
  }
}
