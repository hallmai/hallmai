import type { DynamicModule, Provider } from '@nestjs/common'
import { SetMetadata } from '@nestjs/common'
import { getDataSourceToken } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'

export const TYPEORM_CUSTOM_REPOSITORY = 'TYPEORM_CUSTOM_REPOSITORY'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function CustomRepository(entity: Function): ClassDecorator {
  return SetMetadata(TYPEORM_CUSTOM_REPOSITORY, entity)
}

export class CustomTypeOrmModule {
  public static forCustomRepository<T extends new (...args: any[]) => any>(
    repositories: T[],
    dataSource?: DataSource | DataSourceOptions | string
  ): DynamicModule {
    const providers: Provider[] = []

    for (const RepositoryClass of repositories) {
      const entity: unknown = Reflect.getMetadata(
        TYPEORM_CUSTOM_REPOSITORY,
        RepositoryClass
      )
      if (entity == null) continue

      providers.push({
        inject: [getDataSourceToken(dataSource)],
        provide: RepositoryClass,
        useFactory: (ds: DataSource): InstanceType<T> => {
          const baseRepository = ds.getRepository(
            entity as Parameters<DataSource['getRepository']>[0]
          )
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return new RepositoryClass(
            baseRepository.target,
            baseRepository.manager,
            baseRepository.queryRunner
          ) as InstanceType<T>
        }
      })
    }

    return {
      exports: providers,
      module: CustomTypeOrmModule,
      providers
    }
  }
}
