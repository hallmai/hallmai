import { ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { WsAdapter } from '@nestjs/platform-ws'
import { initializeTransactionalContext } from 'typeorm-transactional'
import { AppModule } from './app.module'
import { LoggerService } from './common/logger/logger.service'
import { NestLoggerAdapter } from './common/logger/nest-logger.adapter'
import { AllExceptionsFilter } from './common/response/error.filter'
import { ResponseInterceptor } from './common/response/response.interceptor'

const PORT = process.env.PORT || 4000

async function bootstrap() {
  initializeTransactionalContext()

  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
  })
  app.useWebSocketAdapter(new WsAdapter(app))
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  const reflector = app.get(Reflector)
  const loggerService = app.get(LoggerService)
  app.useLogger(new NestLoggerAdapter(loggerService))

  app.useGlobalInterceptors(new ResponseInterceptor(reflector, loggerService))
  app.useGlobalFilters(new AllExceptionsFilter())

  await app.listen(PORT)

  return loggerService
}
bootstrap()
  .then((loggerService) => {
    loggerService.info(`Server is running on port ${PORT}`, { port: PORT })
  })
  .catch(console.error)
