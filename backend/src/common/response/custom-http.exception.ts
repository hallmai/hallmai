import { HttpException, HttpStatus } from '@nestjs/common'
import { ErrorCode } from './error-code.enum'

export class CustomHttpException extends HttpException {
  constructor(
    status: HttpStatus,
    errorCode: ErrorCode,
    message: string,
    data?: Record<string, unknown>
  ) {
    super({ errorCode, message, ...data }, status)
  }
}
