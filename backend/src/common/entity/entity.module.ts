import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { addTransactionalDataSource } from 'typeorm-transactional'
import { LoggerService } from '../logger/logger.service'
import { TypeormLogger } from '../logger/typeorm-logger'
import { entities } from './entity.providers'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService, loggerService: LoggerService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        synchronize: true,
        entities,
        logger: new TypeormLogger(loggerService)
      }),
      async dataSourceFactory(option) {
        if (option == null) {
          throw new Error('Invalid typeorm options passed')
        }
        return addTransactionalDataSource(new DataSource(option))
      },
      inject: [ConfigService, LoggerService]
    })
  ]
})
export class EntityModule {}
