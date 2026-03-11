import { GoogleGenAI, Modality, Session } from '@google/genai'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type WebSocket from 'ws'
import { AUDIO_CONFIG, buildSystemPrompt } from './voice.constants'

interface VoiceSession {
  geminiSession: Session
  deviceUuid: string
  transcript: string
  thinking: string
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
              const voiceSession = this.sessions.get(client)
              if (voiceSession) {
                voiceSession.transcript += `User: ${inputTranscription.text}\n`
              }
            }

            // Output transcription (AI speech → text)
            const outputTranscription = sc.outputTranscription as
              | { text?: string }
              | undefined
            if (outputTranscription?.text) {
              const voiceSession = this.sessions.get(client)
              if (voiceSession) {
                voiceSession.transcript += `AI: ${outputTranscription.text}\n`
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
                    voiceSession.thinking += `${part.text}\n`
                  }
                }
              }
            }

            // Turn complete
            if (sc.turnComplete) {
              this.send(client, 'turn_complete', {})
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
      transcript: '',
      thinking: ''
    })
    this.send(client, 'ready', {})

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
  ): { deviceUuid: string; transcript: string; thinking: string } | null {
    const session = this.sessions.get(client)
    if (!session) return null

    const { deviceUuid, transcript, thinking } = session

    try {
      session.geminiSession.close()
    } catch (err) {
      this.logger.warn(`Error closing Gemini session: ${String(err)}`)
    }

    this.sessions.delete(client)
    this.send(client, 'ended', {})

    return { deviceUuid, transcript, thinking }
  }

  getSession(client: WebSocket): VoiceSession | undefined {
    return this.sessions.get(client)
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
