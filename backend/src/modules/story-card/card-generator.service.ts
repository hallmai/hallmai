import { GoogleGenAI } from '@google/genai'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GEMINI_CLIENT } from '../../common/gemini.provider'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { IsNull, Not, Repository } from 'typeorm'
import { Device } from '../../common/entity/device.entity'
import type {
  DailyStoryData,
  Vibe
} from '../../common/entity/story-card.entity'
import { ConversationService } from '../conversation/conversation.service'
import { StoryCardService } from './story-card.service'

const CARD_PROMPT = `대화 기록을 바탕으로 가족에게 보여줄 카드를 만들어주세요.
- topic: 대화 주제 한 문장 요약
- quote: 상대방 실제 발화 인용
- vibe: warm / calm / quiet 중 하나

포함 금지: 건강 세부(증상, 약 이름), 가족 갈등, 금전 관련

JSON으로만 응답: {"topic": "...", "quote": "...", "vibe": "..."}`

@Injectable()
export class CardGeneratorService {
  private readonly logger = new Logger(CardGeneratorService.name)

  constructor(
    private readonly config: ConfigService,
    @Inject(GEMINI_CLIENT) private readonly ai: GoogleGenAI,
    private readonly conversationService: ConversationService,
    private readonly storyCardService: StoryCardService,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>
  ) {}

  @Cron('0 10 * * *', { timeZone: 'Asia/Seoul' })
  async generateDailyCards(): Promise<void> {
    this.logger.log('Starting daily card generation')

    // Only generate for devices linked to a family member
    const devices = await this.deviceRepository.find({
      where: { linkedAt: Not(IsNull()) }
    })

    const yesterday = subDays(new Date(), 1)
    const dayStart = startOfDay(yesterday)
    const dayEnd = endOfDay(yesterday)

    for (const device of devices) {
      try {
        // Skip if card already exists for yesterday
        if (await this.storyCardService.existsForDate(device.id, yesterday)) {
          this.logger.debug(
            `Card already exists for device ${device.id}, skipping`
          )
          continue
        }

        // Get yesterday's conversations
        const conversations =
          await this.conversationService.findByDeviceAndDateRange(
            device.id,
            dayStart,
            dayEnd
          )

        if (conversations.length === 0) {
          this.logger.debug(
            `No conversations for device ${device.id}, skipping`
          )
          continue
        }

        // Combine transcripts
        const combinedTranscript = conversations
          .map((c) =>
            c.transcript
              ? c.transcript.map((e) => `${e.role}: ${e.text}`).join('\n')
              : ''
          )
          .filter(Boolean)
          .join('\n---\n')

        if (!combinedTranscript.trim()) {
          this.logger.debug(
            `Empty transcripts for device ${device.id}, skipping`
          )
          continue
        }

        // Generate card data using Gemini
        const cardData = await this.generateCardData(combinedTranscript)
        if (!cardData) {
          this.logger.warn(
            `Failed to generate card data for device ${device.id}`
          )
          continue
        }

        await this.storyCardService.create(device.id, yesterday, cardData)
        this.logger.log(`Card created for device ${device.id}`)
      } catch (err) {
        this.logger.error(
          `Error generating card for device ${device.id}: ${String(err)}`
        )
      }
    }

    this.logger.log('Daily card generation completed')
  }

  private async generateCardData(
    transcript: string
  ): Promise<DailyStoryData | null> {
    try {
      const model =
        this.config.get<string>('GEMINI_TEXT_MODEL') ||
        this.config.get<string>('GEMINI_MODEL') ||
        'gemini-2.5-flash'

      const response = await this.ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: `${CARD_PROMPT}\n\n대화 기록:\n${transcript}` }]
          }
        ],
        config: { responseMimeType: 'application/json' }
      })

      const text = response.text
      if (!text) return null

      const parsed = JSON.parse(text) as Record<string, unknown>

      // Validate required fields
      if (!parsed.topic || !parsed.quote || !parsed.vibe) return null

      // Validate vibe value
      const validVibes: Vibe[] = ['warm', 'calm', 'quiet']
      const vibe = String(parsed.vibe)
      const resolvedVibe: Vibe = validVibes.includes(vibe as Vibe)
        ? (vibe as Vibe)
        : 'calm'

      return {
        topic: String(parsed.topic),
        quote: String(parsed.quote),
        vibe: resolvedVibe
      }
    } catch (err) {
      this.logger.error(`Gemini API error: ${String(err)}`)
      return null
    }
  }
}
