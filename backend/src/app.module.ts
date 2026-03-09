import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { EntityModule } from './common/entity/entity.module'
import { LoggerModule } from './common/logger/logger.module'
import { AuthModule } from './modules/auth/auth.module'
import { ConversationModule } from './modules/conversation/conversation.module'
import { DeviceModule } from './modules/device/device.module'
import { HealthModule } from './modules/health/health.module'
import { PostModule } from './modules/post/post.module'
import { StoryCardModule } from './modules/story-card/story-card.module'
import { VoiceModule } from './modules/voice/voice.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    ScheduleModule.forRoot(),
    LoggerModule.register({
      isGlobal: true,
      expressLogParserOptions: {
        filteredValue: '[FILTERED]',
        filterParameters: ['password']
      },
      winstonLoggerOptions: {
        isDebugMode: process.env.NODE_ENV !== 'production',
        assignedFormat: { service: 'hallmai' },
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
      }
    }),
    EntityModule,
    AuthModule,
    DeviceModule,
    PostModule,
    HealthModule,
    VoiceModule,
    ConversationModule,
    StoryCardModule
  ]
})
export class AppModule {}
