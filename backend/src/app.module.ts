import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { EntityModule } from './common/entity/entity.module'
import { GeminiModule } from './common/gemini.module'
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
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 30 }]
    }),
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
    GeminiModule,
    AuthModule,
    DeviceModule,
    PostModule,
    HealthModule,
    VoiceModule,
    ConversationModule,
    StoryCardModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
