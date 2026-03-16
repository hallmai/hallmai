import { GoogleGenAI, Modality, Session, Type } from '@google/genai'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type WebSocket from 'ws'
import type { TranscriptEntry } from '../../common/entity/conversation.entity'
import type { SoulMaturity } from '../../common/entity/device-soul.entity'
import { GEMINI_CLIENT } from '../../common/gemini.provider'
import {
  AUDIO_CONFIG,
  type RecentSummary,
  SESSION_RENEWAL_TURN_THRESHOLD,
  SILENCE_GRACE_MS,
  SILENCE_TIMEOUT_MS,
  SILENCE_WARNING_MS,
  buildSystemPrompt
} from './voice.constants'

type ToolHandler = (
  args: Record<string, unknown>
) => Promise<Record<string, unknown>>

interface VoiceSession {
  geminiSession: Session
  deviceUuid: string
  conversationId: number | null
  transcript: TranscriptEntry[]
  lastSpeaker: 'user' | 'ai' | null
  currentThinking: string
  pendingToolCalls: Set<string>
  pendingYoutube: { videoId: string; title: string } | null
  silenceWarningTimer: ReturnType<typeof setTimeout> | null
  silenceTimer: ReturnType<typeof setTimeout> | null
  silenceGraceTimer: ReturnType<typeof setTimeout> | null
  onSilenceTimeout: (() => void) | null
  userTurnCount: number
  isRenewing: boolean
  audioBuffer: string[]
  onRenewal: (() => void) | null
}

interface ToolCallPayload {
  functionCalls?: Array<{
    id: string
    name: string
    args: Record<string, unknown>
  }>
}

interface ToolCallCancellationPayload {
  ids?: string[]
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name)
  private readonly sessions = new Map<WebSocket, VoiceSession>()
  private readonly toolHandlers = new Map<string, ToolHandler>()

  constructor(
    private readonly config: ConfigService,
    @Inject(GEMINI_CLIENT) private readonly ai: GoogleGenAI
  ) {}

  async startSession(
    client: WebSocket,
    deviceUuid: string,
    soulContext?: string,
    recentSummaries?: RecentSummary[],
    maturity?: SoulMaturity,
    resumeContext?: string,
    skipInitialTrigger?: boolean
  ): Promise<void> {
    const systemPromptText =
      buildSystemPrompt(soulContext, recentSummaries, maturity) +
      (resumeContext ? `\n\n${resumeContext}` : '')

    const session = await this.createGeminiSession(
      client,
      deviceUuid,
      systemPromptText
    )

    this.sessions.set(client, {
      geminiSession: session,
      deviceUuid,
      conversationId: null,
      transcript: [],
      lastSpeaker: null,
      currentThinking: '',
      pendingToolCalls: new Set(),
      pendingYoutube: null,
      silenceWarningTimer: null,
      silenceTimer: null,
      silenceGraceTimer: null,
      onSilenceTimeout: null,
      userTurnCount: 0,
      isRenewing: false,
      audioBuffer: [],
      onRenewal: null
    })
    this.send(client, 'ready', {})
    this.resetSilenceTimer(client)

    // Trigger AI to greet or resume (skip when photo will be sent instead)
    if (!skipInitialTrigger) {
      session.sendClientContent({
        turns: [
          {
            role: 'user',
            parts: [
              {
                text: resumeContext ? '(유튜브 시청 후 복귀)' : '(대화 시작)'
              }
            ]
          }
        ],
        turnComplete: true
      })
    }
  }

  sendPhoto(client: WebSocket, base64: string, mimeType: string): void {
    const session = this.sessions.get(client)
    if (!session) return
    session.geminiSession.sendClientContent({
      turns: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: '(사진 전송)' }
          ]
        }
      ],
      turnComplete: true
    })
  }

  sendHotkeyPrompt(client: WebSocket, text: string): void {
    const session = this.sessions.get(client)
    if (!session) return
    this.resetSilenceTimer(client)
    session.geminiSession.sendClientContent({
      turns: [{ role: 'user', parts: [{ text }] }],
      turnComplete: true
    })
  }

  sendAudio(client: WebSocket, audioBase64: string): void {
    const session = this.sessions.get(client)
    if (!session) return

    if (session.isRenewing) {
      session.audioBuffer.push(audioBase64)
      return
    }

    session.geminiSession.sendRealtimeInput({
      media: {
        data: audioBase64,
        mimeType: `audio/pcm;rate=${AUDIO_CONFIG.inputSampleRate}`
      }
    })
  }

  endSession(
    client: WebSocket
  ): { deviceUuid: string; transcript: TranscriptEntry[] } | null {
    const session = this.sessions.get(client)
    if (!session) return null

    const { deviceUuid, transcript } = session

    this.clearSilenceTimers(session)
    session.pendingToolCalls.clear()
    session.pendingYoutube = null

    try {
      session.geminiSession.close()
    } catch (err) {
      this.logger.warn(`Error closing Gemini session: ${String(err)}`)
    }

    this.sessions.delete(client)
    this.send(client, 'ended', {})

    return { deviceUuid, transcript }
  }

  getSession(client: WebSocket): VoiceSession | undefined {
    return this.sessions.get(client)
  }

  registerTool(name: string, handler: ToolHandler): void {
    this.toolHandlers.set(name, handler)
    this.logger.log(`Tool registered: ${name}`)
  }

  setConversationId(client: WebSocket, conversationId: number): void {
    const session = this.sessions.get(client)
    if (session) {
      session.conversationId = conversationId
    }
  }

  setSilenceCallback(client: WebSocket, callback: () => void): void {
    const session = this.sessions.get(client)
    if (session) {
      session.onSilenceTimeout = callback
    }
  }

  resetRenewalState(client: WebSocket): void {
    const session = this.sessions.get(client)
    if (session) {
      session.isRenewing = false
      session.audioBuffer = []
    }
  }

  setRenewalHandler(client: WebSocket, callback: () => void): void {
    const session = this.sessions.get(client)
    if (session) {
      session.onRenewal = callback
    }
  }

  async renewSession(
    client: WebSocket,
    soulContext?: string,
    recentSummaries?: RecentSummary[],
    maturity?: SoulMaturity,
    resumeContext?: string
  ): Promise<void> {
    const session = this.sessions.get(client)
    if (!session) return

    const { deviceUuid } = session

    // Close old Gemini session
    try {
      session.geminiSession.close()
    } catch (err) {
      this.logger.warn(`Error closing old Gemini session: ${String(err)}`)
    }

    // Create new Gemini session
    const systemPromptText =
      buildSystemPrompt(soulContext, recentSummaries, maturity) +
      (resumeContext ? `\n\n${resumeContext}` : '')
    const newGeminiSession = await this.createGeminiSession(
      client,
      deviceUuid,
      systemPromptText
    )

    // Reset session data
    session.geminiSession = newGeminiSession
    session.transcript = []
    session.userTurnCount = 0
    session.lastSpeaker = null
    session.currentThinking = ''

    // Trigger AI to continue naturally
    newGeminiSession.sendClientContent({
      turns: [{ role: 'user', parts: [{ text: '(대화 이어서)' }] }],
      turnComplete: true
    })

    // Notify client
    this.send(client, 'session_renewed', {})

    // Flush audio buffer then unlock
    const buffer = session.audioBuffer
    session.audioBuffer = []
    for (const audio of buffer) {
      newGeminiSession.sendRealtimeInput({
        media: {
          data: audio,
          mimeType: `audio/pcm;rate=${AUDIO_CONFIG.inputSampleRate}`
        }
      })
    }
    session.isRenewing = false

    this.resetSilenceTimer(client)
    this.logger.log(`Session renewed for ${deviceUuid}`)
  }

  resetSilenceTimer(client: WebSocket): void {
    const session = this.sessions.get(client)
    if (!session) return

    this.clearSilenceTimers(session)

    session.silenceWarningTimer = setTimeout(() => {
      this.send(client, 'silence_warning', {})
    }, SILENCE_WARNING_MS)

    session.silenceTimer = setTimeout(() => {
      // Ask AI to say goodbye
      session.geminiSession.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: '(대화 마무리)' }] }],
        turnComplete: true
      })
      // Give AI time to respond and speak, then end
      session.silenceGraceTimer = setTimeout(() => {
        if (session.onSilenceTimeout) {
          Promise.resolve(session.onSilenceTimeout()).catch((err) =>
            this.logger.error(`Silence timeout handler error: ${String(err)}`)
          )
        }
      }, SILENCE_GRACE_MS)
    }, SILENCE_TIMEOUT_MS)
  }

  private async createGeminiSession(
    client: WebSocket,
    deviceUuid: string,
    systemPromptText: string
  ): Promise<Session> {
    const model =
      this.config.get<string>('GEMINI_VOICE_MODEL') ||
      this.config.get<string>('GEMINI_MODEL') ||
      'gemini-2.5-flash-native-audio-preview-12-2025'

    return this.ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: [
          { googleSearch: {} },
          {
            functionDeclarations: [
              {
                name: 'searchYoutube',
                description:
                  '사용자가 노래, 영상, 뉴스 등 미디어를 요청하면 유튜브에서 검색합니다. 검색 결과를 사용자에게 안내하고 어떤 영상을 재생할지 확인받으세요.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: '유튜브 검색어'
                    }
                  },
                  required: ['query']
                }
              },
              {
                name: 'playYoutube',
                description:
                  '사용자가 재생을 확인한 후 영상을 재생합니다. searchYoutube 결과에서 사용자가 선택한 videoId를 전달하세요.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    videoId: {
                      type: Type.STRING,
                      description: '재생할 YouTube 영상 ID'
                    },
                    title: {
                      type: Type.STRING,
                      description: '영상 제목'
                    }
                  },
                  required: ['videoId', 'title']
                }
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPromptText }]
        },
        speechConfig: {
          languageCode: 'ko-KR'
        },
        realtimeInputConfig: {
          automaticActivityDetection: {
            silenceDurationMs: 500
          }
        }
      },
      callbacks: {
        onopen: () => {
          this.logger.debug(`Gemini session opened for ${deviceUuid}`)
        },
        onmessage: (msg) => {
          if (client.readyState !== 1) return

          if (msg.serverContent) {
            this.handleServerContent(client, msg.serverContent)
          }

          const toolCall = (msg as unknown as Record<string, unknown>)
            .toolCall as ToolCallPayload | undefined
          if (toolCall?.functionCalls) {
            this.handleToolCalls(client, toolCall)
          }

          const toolCallCancellation = (
            msg as unknown as Record<string, unknown>
          ).toolCallCancellation as ToolCallCancellationPayload | undefined
          if (toolCallCancellation?.ids) {
            this.handleToolCancellation(client, toolCallCancellation)
          }
        },
        onerror: (err: ErrorEvent) => {
          this.logger.error(
            `Gemini error for ${deviceUuid}: ${err.message}`,
            err
          )
          if (client.readyState === 1) {
            this.send(client, 'error', { message: 'AI connection error' })
          }
        },
        onclose: (e: CloseEvent) => {
          this.logger.debug(
            `Gemini session closed for ${deviceUuid} (code=${e.code}, reason=${e.reason})`
          )
        }
      }
    })
  }

  private handleServerContent(client: WebSocket, serverContent: unknown): void {
    const sc = serverContent as Record<string, unknown>

    // Interrupted
    if (sc.interrupted) {
      this.send(client, 'interrupted', {})
    }

    // Input transcription (user speech → text)
    const inputTranscription = sc.inputTranscription as
      | { text?: string }
      | undefined
    if (inputTranscription?.text) {
      this.resetSilenceTimer(client)
      const voiceSession = this.sessions.get(client)
      if (voiceSession) {
        if (
          voiceSession.lastSpeaker === 'user' &&
          voiceSession.transcript.length > 0
        ) {
          const last =
            voiceSession.transcript[voiceSession.transcript.length - 1]
          last.text += inputTranscription.text
        } else {
          voiceSession.transcript.push({
            role: 'user',
            text: inputTranscription.text
          })
          voiceSession.lastSpeaker = 'user'
          voiceSession.userTurnCount++
        }
      }
    }

    // Output transcription (AI speech → text)
    const outputTranscription = sc.outputTranscription as
      | { text?: string }
      | undefined
    if (outputTranscription?.text) {
      const voiceSession = this.sessions.get(client)
      if (voiceSession) {
        if (
          voiceSession.lastSpeaker === 'ai' &&
          voiceSession.transcript.length > 0
        ) {
          const last =
            voiceSession.transcript[voiceSession.transcript.length - 1]
          last.text += outputTranscription.text
        } else {
          voiceSession.transcript.push({
            role: 'ai',
            text: outputTranscription.text
          })
          voiceSession.lastSpeaker = 'ai'
        }
      }
    }

    // Audio parts in model turn
    if (sc.modelTurn) {
      const modelTurn = sc.modelTurn as {
        parts?: Array<Record<string, unknown>>
      }
      for (const part of modelTurn.parts || []) {
        if (part.inlineData) {
          const inlineData = part.inlineData as { data: string }
          this.send(client, 'audio', { data: inlineData.data })
        }
        // Collect AI thinking/reasoning text
        if (part.text && typeof part.text === 'string') {
          const voiceSession = this.sessions.get(client)
          if (voiceSession) {
            voiceSession.currentThinking += part.text
          }
        }
      }
    }

    // Turn complete
    if (sc.turnComplete) {
      const voiceSession = this.sessions.get(client)
      if (voiceSession && voiceSession.currentThinking) {
        // Attach accumulated thinking to the last AI entry
        const lastAi = [...voiceSession.transcript]
          .reverse()
          .find((e) => e.role === 'ai')
        if (lastAi) {
          lastAi.thinking = voiceSession.currentThinking
        }
        voiceSession.currentThinking = ''
      }
      if (voiceSession) {
        voiceSession.lastSpeaker = null
      }
      this.send(client, 'turn_complete', {})

      // Send youtube_play after AI finishes speaking
      if (voiceSession?.pendingYoutube) {
        this.send(client, 'youtube_play', {
          videoId: voiceSession.pendingYoutube.videoId,
          title: voiceSession.pendingYoutube.title,
          conversationId: voiceSession.conversationId
        })
        voiceSession.pendingYoutube = null
      }

      // Check session renewal threshold
      if (
        voiceSession &&
        voiceSession.userTurnCount >= SESSION_RENEWAL_TURN_THRESHOLD &&
        !voiceSession.isRenewing &&
        !voiceSession.pendingYoutube
      ) {
        voiceSession.isRenewing = true
        if (voiceSession.onRenewal) {
          voiceSession.onRenewal()
        }
      }

      this.resetSilenceTimer(client)
    }
  }

  private handleToolCalls(client: WebSocket, toolCall: ToolCallPayload): void {
    const voiceSession = this.sessions.get(client)
    if (!voiceSession) return

    for (const fc of toolCall.functionCalls!) {
      voiceSession.transcript.push({
        role: 'tool',
        text: '',
        toolName: fc.name,
        toolCallId: fc.id,
        toolArgs: fc.args,
        toolStatus: 'pending'
      })
      voiceSession.pendingToolCalls.add(fc.id)
      this.send(client, 'tool_activity', {
        status: 'pending',
        toolName: fc.name,
        toolCallId: fc.id
      })

      const handler = this.toolHandlers.get(fc.name)
      if (handler) {
        handler(fc.args)
          .then((result) => {
            if (!voiceSession.pendingToolCalls.has(fc.id)) return
            const entry = voiceSession.transcript.find(
              (e) => e.toolCallId === fc.id
            )
            if (entry) {
              entry.toolResult = result
              entry.toolStatus = 'completed'
            }
            voiceSession.pendingToolCalls.delete(fc.id)

            // playYoutube: save for sending after turn_complete
            if (fc.name === 'playYoutube' && result.videoId) {
              voiceSession.pendingYoutube = result as {
                videoId: string
                title: string
              }
            }

            this.trySendToolResponse(voiceSession.geminiSession, [
              { name: fc.name, id: fc.id, response: result }
            ])

            this.send(client, 'tool_activity', {
              status: 'completed',
              toolName: fc.name,
              toolCallId: fc.id
            })
          })
          .catch((err) => {
            if (!voiceSession.pendingToolCalls.has(fc.id)) return
            this.logger.error(
              `Tool handler error for ${fc.name}: ${String(err)}`
            )
            const entry = voiceSession.transcript.find(
              (e) => e.toolCallId === fc.id
            )
            if (entry) {
              entry.toolStatus = 'error'
              entry.toolResult = { error: String(err) }
            }
            voiceSession.pendingToolCalls.delete(fc.id)

            this.trySendToolResponse(voiceSession.geminiSession, [
              { name: fc.name, id: fc.id, response: { error: String(err) } }
            ])

            this.send(client, 'tool_activity', {
              status: 'error',
              toolName: fc.name,
              toolCallId: fc.id
            })
          })
      } else {
        this.logger.warn(`No handler registered for tool: ${fc.name}`)
        const entry = voiceSession.transcript.find(
          (e) => e.toolCallId === fc.id
        )
        if (entry) {
          entry.toolStatus = 'error'
          entry.toolResult = { error: 'No handler registered' }
        }
        voiceSession.pendingToolCalls.delete(fc.id)
        this.trySendToolResponse(voiceSession.geminiSession, [
          { name: fc.name, id: fc.id, response: { error: 'Unknown tool' } }
        ])
      }
    }
  }

  private handleToolCancellation(
    client: WebSocket,
    toolCallCancellation: ToolCallCancellationPayload
  ): void {
    const voiceSession = this.sessions.get(client)
    if (!voiceSession) return

    for (const id of toolCallCancellation.ids!) {
      const entry = voiceSession.transcript.find((e) => e.toolCallId === id)
      if (entry) {
        entry.toolStatus = 'cancelled'
      }
      voiceSession.pendingToolCalls.delete(id)
      this.send(client, 'tool_activity', {
        status: 'cancelled',
        toolCallId: id
      })
    }
  }

  private trySendToolResponse(
    session: Session,
    functionResponses: Array<{
      name: string
      id: string
      response: Record<string, unknown>
    }>
  ): void {
    try {
      session.sendToolResponse({ functionResponses })
    } catch (e) {
      this.logger.warn(
        `Failed to send tool response (session closed): ${String(e)}`
      )
    }
  }

  private clearSilenceTimers(session: VoiceSession): void {
    if (session.silenceWarningTimer) {
      clearTimeout(session.silenceWarningTimer)
      session.silenceWarningTimer = null
    }
    if (session.silenceTimer) {
      clearTimeout(session.silenceTimer)
      session.silenceTimer = null
    }
    if (session.silenceGraceTimer) {
      clearTimeout(session.silenceGraceTimer)
      session.silenceGraceTimer = null
    }
  }

  private send(
    client: WebSocket,
    event: string,
    data: Record<string, unknown>
  ): void {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ event, data }))
    }
  }
}
