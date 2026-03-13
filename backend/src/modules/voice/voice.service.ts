import {
  EndSensitivity,
  GoogleGenAI,
  Modality,
  Session,
  StartSensitivity
} from '@google/genai'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type WebSocket from 'ws'
import type { TranscriptEntry } from '../../common/entity/conversation.entity'
import { GEMINI_CLIENT } from '../../common/gemini.provider'
import {
  AUDIO_CONFIG,
  type RecentSummary,
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
  transcript: TranscriptEntry[]
  lastSpeaker: 'user' | 'ai' | null
  currentThinking: string
  pendingToolCalls: Set<string>
  silenceWarningTimer: ReturnType<typeof setTimeout> | null
  silenceTimer: ReturnType<typeof setTimeout> | null
  silenceGraceTimer: ReturnType<typeof setTimeout> | null
  onSilenceTimeout: (() => void) | null
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
    recentSummaries?: RecentSummary[]
  ): Promise<void> {
    const model =
      this.config.get<string>('GEMINI_VOICE_MODEL') ||
      this.config.get<string>('GEMINI_MODEL') ||
      'gemini-live-2.5-flash-native-audio'

    const session = await this.ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: [{ googleSearch: {} }],
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(soulContext, recentSummaries) }]
        },
        speechConfig: {
          languageCode: 'ko-KR'
        },
        realtimeInputConfig: {
          automaticActivityDetection: {
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            prefixPaddingMs: 400,
            silenceDurationMs: 2000
          }
        }
      },
      callbacks: {
        onopen: () => {
          this.logger.debug(`Gemini session opened for ${deviceUuid}`)
        },
        onmessage: (msg) => {
          if (client.readyState !== 1) return

          // Server content with model turn
          if (msg.serverContent) {
            const sc = msg.serverContent as Record<string, unknown>

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
              this.resetSilenceTimer(client)
            }
          }

          // Tool call from Gemini (custom function calls)
          const toolCall = (msg as Record<string, unknown>).toolCall as
            | {
                functionCalls?: Array<{
                  id: string
                  name: string
                  args: Record<string, unknown>
                }>
              }
            | undefined
          if (toolCall?.functionCalls) {
            const voiceSession = this.sessions.get(client)
            if (voiceSession) {
              for (const fc of toolCall.functionCalls) {
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

                      try {
                        voiceSession.geminiSession.sendToolResponse({
                          functionResponses: [
                            { name: fc.name, id: fc.id, response: result }
                          ]
                        })
                      } catch (e) {
                        this.logger.warn(
                          `Failed to send tool response (session closed): ${String(e)}`
                        )
                      }

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

                      try {
                        voiceSession.geminiSession.sendToolResponse({
                          functionResponses: [
                            {
                              name: fc.name,
                              id: fc.id,
                              response: { error: String(err) }
                            }
                          ]
                        })
                      } catch (e) {
                        this.logger.warn(
                          `Failed to send tool error response (session closed): ${String(e)}`
                        )
                      }

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
                  try {
                    voiceSession.geminiSession.sendToolResponse({
                      functionResponses: [
                        {
                          name: fc.name,
                          id: fc.id,
                          response: { error: 'Unknown tool' }
                        }
                      ]
                    })
                  } catch (e) {
                    this.logger.warn(
                      `Failed to send unknown tool response: ${String(e)}`
                    )
                  }
                }
              }
            }
          }

          // Tool call cancellation
          const toolCallCancellation = (msg as Record<string, unknown>)
            .toolCallCancellation as { ids?: string[] } | undefined
          if (toolCallCancellation?.ids) {
            const voiceSession = this.sessions.get(client)
            if (voiceSession) {
              for (const id of toolCallCancellation.ids) {
                const entry = voiceSession.transcript.find(
                  (e) => e.toolCallId === id
                )
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

    this.sessions.set(client, {
      geminiSession: session,
      deviceUuid,
      transcript: [],
      lastSpeaker: null,
      currentThinking: '',
      pendingToolCalls: new Set(),
      silenceWarningTimer: null,
      silenceTimer: null,
      silenceGraceTimer: null,
      onSilenceTimeout: null
    })
    this.send(client, 'ready', {})
    this.resetSilenceTimer(client)

    // Trigger AI to greet first
    session.sendClientContent({
      turns: [{ role: 'user', parts: [{ text: '(대화 시작)' }] }],
      turnComplete: true
    })
  }

  sendAudio(client: WebSocket, audioBase64: string): void {
    const session = this.sessions.get(client)
    if (!session) return

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

  setSilenceCallback(client: WebSocket, callback: () => void): void {
    const session = this.sessions.get(client)
    if (session) {
      session.onSilenceTimeout = callback
    }
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
      }, 8000)
    }, SILENCE_TIMEOUT_MS)
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
