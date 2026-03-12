import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Device } from '../../common/entity/device.entity'
import { ConversationModule } from '../conversation/conversation.module'
import { SoulModule } from '../soul/soul.module'
import { VoiceGateway } from './voice.gateway'
import { VoiceService } from './voice.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    ConversationModule,
    SoulModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET')
      })
    })
  ],
  providers: [VoiceGateway, VoiceService],
  exports: [VoiceService]
})
export class VoiceModule {}
