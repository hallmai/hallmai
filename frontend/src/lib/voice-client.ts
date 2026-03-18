import { getAccessToken } from './auth'
import { AudioPlayer } from './audio-player'
import { AudioRecorder } from './audio-recorder'
import { API_URL } from './config'

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'ending'

interface WsMessage {
  event: string
  data?: Record<string, unknown>
}

export interface YoutubePlayData {
  videoId: string
  title: string
  conversationId: number
}

export type VoiceEventHandler = {
  onStateChange: (state: VoiceState) => void
  onError: (message: string) => void
  onVolume?: (level: number) => void
  onSilenceWarning?: () => void
  onToolActivity?: (data: Record<string, unknown>) => void
  onYoutubePlay?: (data: YoutubePlayData) => void
}

export class VoiceClient {
  private ws: WebSocket | null = null
  private recorder: AudioRecorder | null = null
  private player: AudioPlayer | null = null
  private state: VoiceState = 'idle'
  private handler: VoiceEventHandler
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null
  private disconnectResolve: (() => void) | null = null
  private pendingInterrupt = false
  private muteUntil = 0

  private readonly wsUrl: string

  constructor(handler: VoiceEventHandler) {
    this.handler = handler
    const wsBase = API_URL.replace(/^http/, 'ws')
    this.wsUrl = `${wsBase}/ws/voice`
  }

  async connect(
    deviceUuid: string,
    options?: {
      resumeFrom?: number
      photoBase64?: string
      photoMimeType?: string
    }
  ): Promise<void> {
    if (this.state !== 'idle') return

    this.setState('connecting')

    const token = getAccessToken()
    const url = token ? `${this.wsUrl}?token=${encodeURIComponent(token)}` : this.wsUrl
    const ws = new WebSocket(url)
    this.ws = ws

    ws.onopen = () => {
      this.send('start', { deviceUuid, ...options })
    }

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data as string)
        this.handleMessage(msg)
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {
      if (this.ws !== ws) return
      this.handler.onError('Connection failed')
      this.cleanup()
      this.setState('idle')
    }

    ws.onclose = (event) => {
      // Ignore stale close events from a previous connection.
      // After disconnect() → connect(), the old ws.close() fires onclose
      // asynchronously and would otherwise cleanup() the new connection.
      if (this.ws !== ws) return
      if (event.code === 4001) {
        this.handler.onError('Device not registered')
      }
      this.cleanup()
      if (this.state !== 'idle') {
        this.setState('idle')
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.state === 'idle') return
    if (this.state === 'ending') {
      return new Promise<void>((resolve) => {
        const prev = this.disconnectResolve
        this.disconnectResolve = () => { prev?.(); resolve() }
      })
    }

    this.setState('ending')
    this.send('end', {})

    return new Promise<void>((resolve) => {
      this.disconnectResolve = resolve

      // Force cleanup if server doesn't respond in time
      this.disconnectTimer = setTimeout(() => {
        this.cleanup()
        this.setState('idle')
      }, 2000)
    })
  }

  private handleMessage(msg: WsMessage): void {
    switch (msg.event) {
      case 'ready':
        this.muteUntil = Infinity
        this.player = new AudioPlayer()
        this.startRecording().catch(() => {
            this.handler.onError('Microphone access denied')
            this.cleanup()
            this.setState('idle')
          })
        break
      case 'audio':
        if (this.pendingInterrupt) break
        if (msg.data?.data) {
          if (this.state === 'connecting' || this.state === 'listening') {
            this.setState('speaking')
          }
          this.player?.enqueue(msg.data.data as string)
        }
        break
      case 'interrupted':
        this.pendingInterrupt = false
        this.muteUntil = 0
        this.player?.interrupt()
        this.setState('listening')
        break
      case 'turn_complete':
        this.pendingInterrupt = false
        this.muteUntil = 0
        this.setState('listening')
        break
      case 'ended':
        this.cleanup()
        this.setState('idle')
        break
      case 'tool_activity':
        this.handler.onToolActivity?.(msg.data || {})
        break
      case 'youtube_play':
        this.handler.onYoutubePlay?.(msg.data as unknown as YoutubePlayData)
        break
      case 'session_renewed':
        this.muteUntil = Infinity
        console.debug('[voice] session renewed')
        break
      case 'silence_warning':
        this.handler.onSilenceWarning?.()
        break
      case 'error':
        this.handler.onError((msg.data?.message as string) || 'Unknown error')
        break
    }
  }

  private async startRecording(): Promise<void> {
    this.recorder = new AudioRecorder()
    await this.recorder.start(
      (base64) => {
        // Hard mute: initial wait, session renewal
        if (Date.now() < this.muteUntil) return
        // Speaker playing → block mic entirely (echo prevention)
        if (this.player?.isPlayingOrRecent(300)) return
        this.send('audio', { data: base64 })
      },
      this.handler.onVolume
        ? (level) => this.handler.onVolume!(level)
        : undefined,
    )
  }

  interrupt(): void {
    if (this.state !== 'speaking') return
    this.pendingInterrupt = true
    this.muteUntil = 0
    this.player?.interrupt()
    this.setState('listening')
  }

  sendHotkey(prompt: string): void {
    this.interrupt()
    this.send('hotkey', { prompt })
  }

  private send(event: string, data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    }
  }

  private cleanup(): void {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer)
      this.disconnectTimer = null
    }
    this.pendingInterrupt = false
    this.recorder?.stop()
    this.recorder = null
    this.player?.destroy()
    this.player = null
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close()
    }
    this.ws = null
  }

  private setState(state: VoiceState): void {
    this.state = state
    this.handler.onStateChange(state)
    if (state === 'idle' && this.disconnectResolve) {
      this.disconnectResolve()
      this.disconnectResolve = null
    }
  }
}
