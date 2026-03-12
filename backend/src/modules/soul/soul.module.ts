import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceSoul } from '../../common/entity/device-soul.entity'
import { SoulService } from './soul.service'

@Module({
  imports: [TypeOrmModule.forFeature([DeviceSoul])],
  providers: [SoulService],
  exports: [SoulService]
})
export class SoulModule {}
