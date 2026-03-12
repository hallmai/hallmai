import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceSoul } from '../../common/entity/device-soul.entity'
import { GeminiProvider } from '../../common/gemini.provider'
import { SoulService } from './soul.service'

@Module({
  imports: [TypeOrmModule.forFeature([DeviceSoul])],
  providers: [GeminiProvider, SoulService],
  exports: [SoulService]
})
export class SoulModule {}
