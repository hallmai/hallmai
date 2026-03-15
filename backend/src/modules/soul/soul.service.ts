import { GoogleGenAI } from '@google/genai'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { uuidv7 } from 'uuidv7'
import type { TranscriptEntry } from '../../common/entity/conversation.entity'
import {
  DeviceSoul,
  type SoulMaturity,
  type SoulProfile
} from '../../common/entity/device-soul.entity'
import { GEMINI_CLIENT } from '../../common/gemini.provider'
import {
  formatTranscript,
  getTextModel,
  wrapTranscript
} from '../../common/gemini.util'

const SOUL_PROMPT = `당신은 AI 말동무 '할마이'의 기억 관리자입니다.
대화 기록을 분석하여 이 시니어에 대한 프로필을 업데이트합니다.

기존 프로필과 새 대화를 함께 보고, **최신 상태의 완전한 프로필**을 다시 작성하세요.

규칙:
- 새 대화가 기존 정보와 충돌하면 새 정보를 우선합니다 (예: "산책 매일" → "무릎 아파서 산책 못 함")
- 더 이상 유효하지 않은 정보는 제거합니다
- 확실하지 않은 추측은 포함하지 마세요
- 각 항목은 짧고 명확하게 한국어로 작성하세요
- callerName은 사용자가 호칭을 알려준 경우에만 기록하세요
- 사용자가 직접 반말을 요청한 경우에만 speechStyle을 기록하세요. 기본은 존댓말이므로 별도 기록 불필요

JSON으로만 응답하세요:
{
  "tone": "이 분과의 대화 톤 (예: '유머 잘 받아주셔서 장난스럽게')",
  "callerName": "호칭 (예: '순자씨', '김 할머니'). 사용자가 알려준 경우에만 기록",
  "speechStyle": "말투 선호. 사용자가 직접 반말을 요청한 경우에만 기록 (예: '반말')",
  "sharedMemories": ["공유 기억/에피소드"],
  "strategies": ["대화 전략 (예: '건강 얘기 조심')"],
  "interests": ["관심사/취미"],
  "family": ["가족 관계 (예: '손자 민수 초등학교 3학년')"],
  "routines": ["일상 패턴 (예: '아침 6시 기상')"],
  "emotions": ["감정 경향 (예: '손자 이야기에 기분 좋아하심')"],
  "preferences": ["대화 선호 (예: '트로트 이야기 좋아하심')"]
}`

@Injectable()
export class SoulService {
  private readonly logger = new Logger(SoulService.name)

  constructor(
    private readonly config: ConfigService,
    @Inject(GEMINI_CLIENT) private readonly ai: GoogleGenAI,
    @InjectRepository(DeviceSoul)
    private readonly soulRepository: Repository<DeviceSoul>
  ) {}

  async extract(
    deviceId: number,
    conversationId: number,
    transcript: TranscriptEntry[]
  ): Promise<void> {
    const transcriptText = formatTranscript(transcript)
    if (!transcriptText) return

    // Load existing soul
    const existing = await this.soulRepository.findOneBy({ deviceId })
    const existingProfile = existing?.profile || {}

    const prompt = `${SOUL_PROMPT}

기존 프로필:
${JSON.stringify(existingProfile, null, 2)}

${wrapTranscript(transcriptText)}`

    try {
      const response = await this.ai.models.generateContent({
        model: getTextModel(this.config),
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      })

      const text = response.text
      if (!text) {
        this.logger.warn(`Empty response from Gemini for device ${deviceId}`)
        return
      }

      const parsed = JSON.parse(text) as Record<string, unknown>
      const profile = this.sanitizeProfile(parsed)

      await this.soulRepository
        .createQueryBuilder()
        .insert()
        .values({
          deviceId,
          profile,
          lastConversationId: conversationId,
          pid: uuidv7()
        })
        .orUpdate(['profile', 'last_conversation_id'], ['device_id'])
        .execute()

      this.logger.log(`Soul updated for device ${deviceId}`)
    } catch (err) {
      this.logger.error(
        `Soul extraction failed for device ${deviceId}: ${String(err)}`
      )
    }
  }

  private sanitizeProfile(raw: Record<string, unknown>): SoulProfile {
    return {
      tone: typeof raw.tone === 'string' ? raw.tone : undefined,
      callerName:
        typeof raw.callerName === 'string' ? raw.callerName : undefined,
      speechStyle:
        typeof raw.speechStyle === 'string' ? raw.speechStyle : undefined,
      sharedMemories: this.toStringArray(raw.sharedMemories),
      strategies: this.toStringArray(raw.strategies),
      interests: this.toStringArray(raw.interests),
      family: this.toStringArray(raw.family),
      routines: this.toStringArray(raw.routines),
      emotions: this.toStringArray(raw.emotions),
      preferences: this.toStringArray(raw.preferences)
    }
  }

  private toStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined
    return value.filter(
      (v): v is string => typeof v === 'string' && v.trim() !== ''
    )
  }

  async getProfileWithMaturity(
    deviceId: number
  ): Promise<{ profileText: string | null; maturity: SoulMaturity }> {
    const soul = await this.soulRepository.findOneBy({ deviceId })
    if (!soul) return { profileText: null, maturity: 'explore' }

    const profileText = this.formatProfileText(soul.profile)
    const maturity = this.calculateMaturity(soul.profile)
    return { profileText, maturity }
  }

  // AI 필드(tone, sharedMemories, strategies)는 제외 —
  // 성숙도는 "사용자에 대해 얼마나 아는가"를 기준으로 판단.
  // AI 필드는 첫 대화 1회만으로도 채워질 수 있어 성숙도 지표로 부적합.
  private calculateMaturity(profile: SoulProfile): SoulMaturity {
    const userFields = [
      profile.interests,
      profile.family,
      profile.routines,
      profile.emotions,
      profile.preferences
    ]
    const filledCount = userFields.filter(
      (f) => Array.isArray(f) && f.length > 0
    ).length

    if (filledCount <= 1) return 'explore'
    if (filledCount <= 3) return 'bonding'
    return 'friend'
  }

  private formatProfileText(p: SoulProfile): string | null {
    const fmt = (label: string, arr?: string[]) =>
      arr?.length ? `${label}: ${arr.join(', ')}` : null

    const sections: string[] = []

    // AI Soul section
    const aiParts = [
      p.callerName
        ? `호칭: 이 분을 "${p.callerName}"(이)라고 불러주세요`
        : null,
      p.speechStyle ? `말투: ${p.speechStyle}` : null,
      p.tone ? `대화 톤: ${p.tone}` : null,
      fmt('공유 기억', p.sharedMemories),
      fmt('대화 전략', p.strategies)
    ].filter(Boolean) as string[]

    if (aiParts.length) {
      sections.push(`## 당신(할마이)과 이 분의 관계\n${aiParts.join('\n')}`)
    }

    // User Profile section
    const userParts = [
      fmt('관심사/취미', p.interests),
      fmt('가족 관계', p.family),
      fmt('일상 패턴', p.routines),
      fmt('감정 경향', p.emotions),
      fmt('대화 선호', p.preferences)
    ].filter(Boolean) as string[]

    if (userParts.length) {
      sections.push(`## 이 분에 대해 알고 있는 정보\n${userParts.join('\n')}`)
    }

    return sections.length ? sections.join('\n\n') : null
  }
}
