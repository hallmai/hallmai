import { ValidationPipe } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { NestFactory } from '@nestjs/core'
import { initializeTransactionalContext } from 'typeorm-transactional'
import { AppModule } from './app.module'
import { LoggerService } from './common/logger/logger.service'
import { AllExceptionsFilter } from './common/response/error.filter'
import { ResponseInterceptor } from './common/response/response.interceptor'

const PORT = process.env.PORT || 4000

async function bootstrap() {
  initializeTransactionalContext()

  const app = await NestFactory.create(AppModule)

  app.enableCors()
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
