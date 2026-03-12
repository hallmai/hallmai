import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Device } from '../../common/entity/device.entity'
import { StoryCard } from '../../common/entity/story-card.entity'
import { GeminiProvider } from '../../common/gemini.provider'
import { ConversationModule } from '../conversation/conversation.module'
import { DeviceModule } from '../device/device.module'
import { CardGeneratorService } from './card-generator.service'
import { StoryCardController } from './story-card.controller'
import { StoryCardService } from './story-card.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([StoryCard, Device]),
    ConversationModule,
    DeviceModule
  ],
  controllers: [StoryCardController],
  providers: [GeminiProvider, StoryCardService, CardGeneratorService],
  exports: [StoryCardService]
})
export class StoryCardModule {}
