import { GoogleGenAI } from '@google/genai'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, IsNull, Not, Repository } from 'typeorm'
import {
  Conversation,
  type TranscriptEntry
} from '../../common/entity/conversation.entity'
import { GEMINI_CLIENT } from '../../common/gemini.provider'
import {
  formatTranscript,
  getTextModel,
  wrapTranscript
} from '../../common/gemini.util'

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name)

  constructor(
    private readonly config: ConfigService,
    @Inject(GEMINI_CLIENT) private readonly ai: GoogleGenAI,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>
  ) {}

  async create(
    deviceId: number,
    rootConversationId?: number
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      deviceId,
      startedAt: new Date(),
      rootConversationId: rootConversationId ?? null
    })
    const saved = await this.conversationRepository.save(conversation)
    if (!rootConversationId) {
      saved.rootConversationId = saved.id
      await this.conversationRepository.save(saved)
    }
    return saved
  }

  async findById(id: number): Promise<Conversation | null> {
    return this.conversationRepository.findOneBy({ id })
  }

  async end(id: number, transcript: TranscriptEntry[] | null): Promise<void> {
    const now = new Date()
    const conversation = await this.conversationRepository.findOneBy({ id })
    if (!conversation) return

    const durationSeconds = Math.round(
      (now.getTime() - conversation.startedAt.getTime()) / 1000
    )

    await this.conversationRepository.update(id, {
      endedAt: now,
      durationSeconds,
      transcript: (transcript || null) as any
    })
  }

  async summarize(
    conversationId: number,
    transcript: TranscriptEntry[]
  ): Promise<void> {
    const text = formatTranscript(transcript)
    if (!text) return

    try {
      const response = await this.ai.models.generateContent({
        model: getTextModel(this.config),
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `다음 대화 기록을 1~3문장으로 요약하세요.
핵심 주제, 언급된 사건, 감정 상태를 간결하게 포함하세요.
한국어로 작성하세요.

JSON으로만 응답하세요:
{ "summary": "요약 내용" }

${wrapTranscript(text)}`
              }
            ]
          }
        ],
        config: { responseMimeType: 'application/json' }
      })

      const parsed = JSON.parse(response.text || '{}') as {
        summary?: string
      }
      if (parsed.summary) {
        await this.conversationRepository.update(conversationId, {
          summary: parsed.summary
        })
        this.logger.log(`Summary saved for conversation ${conversationId}`)
      }
    } catch (err) {
      this.logger.error(
        `Summary generation failed for conversation ${conversationId}: ${String(err)}`
      )
    }
  }

  async getRecentSummaries(
    deviceId: number,
    count: number
  ): Promise<{ date: Date; summary: string }[]> {
    const conversations = await this.conversationRepository.find({
      where: {
        deviceId,
        summary: Not(IsNull()),
        endedAt: Not(IsNull())
      },
      order: { startedAt: 'DESC' },
      take: count,
      select: ['startedAt', 'summary']
    })

    return conversations.map((c) => ({
      date: c.startedAt,
      summary: c.summary!
    }))
  }

  async findByDeviceAndDateRange(
    deviceId: number,
    start: Date,
    end: Date
  ): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: {
        deviceId,
        startedAt: Between(start, end)
      }
    })
  }
}
