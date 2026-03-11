import { GoogleGenAI, Modality, Session } from '@google/genai'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type WebSocket from 'ws'
import type { TranscriptEntry } from '../../common/entity/conversation.entity'
import {
  AUDIO_CONFIG,
  SILENCE_TIMEOUT_MS,
  SILENCE_WARNING_MS,
  buildSystemPrompt
} from './voice.constants'

interface VoiceSession {
  geminiSession: Session
  deviceUuid: string
  transcript: TranscriptEntry[]
  lastSpeaker: 'user' | 'ai' | null
  currentThinking: string
  silenceWarningTimer: ReturnType<typeof setTimeout> | null
  silenceTimer: ReturnType<typeof setTimeout> | null
  silenceGraceTimer: ReturnType<typeof setTimeout> | null
  onSilenceTimeout: (() => void) | null
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name)
  private readonly sessions = new Map<WebSocket, VoiceSession>()
  private readonly ai: GoogleGenAI

  constructor(private readonly config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY')
    })
  }

  async startSession(client: WebSocket, deviceUuid: string): Promise<void> {
    const model =
      this.config.get<string>('GEMINI_MODEL') ||
      'gemini-2.5-flash-native-audio-preview-12-2025'

    const session = await this.ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        speechConfig: {
          languageCode: 'ko-KR'
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
        turns: [
          { role: 'user', parts: [{ text: '(대화 마무리)' }] }
        ],
        turnComplete: true
      })
      // Give AI time to respond and speak, then end
      session.silenceGraceTimer = setTimeout(() => {
        if (session.onSilenceTimeout) {
          session.onSilenceTimeout()
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
