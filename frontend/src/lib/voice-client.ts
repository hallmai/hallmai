import { AudioPlayer } from './audio-player'
import { AudioRecorder } from './audio-recorder'

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'ending'

interface WsMessage {
  event: string
  data?: Record<string, unknown>
}

export type VoiceEventHandler = {
  onStateChange: (state: VoiceState) => void
  onError: (message: string) => void
}

export class VoiceClient {
  private ws: WebSocket | null = null
  private recorder: AudioRecorder | null = null
  private player: AudioPlayer | null = null
  private state: VoiceState = 'idle'
  private handler: VoiceEventHandler

  private readonly wsUrl: string

  constructor(handler: VoiceEventHandler) {
    this.handler = handler
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const wsBase = apiUrl.replace(/^http/, 'ws')
    this.wsUrl = `${wsBase}/ws/voice`
  }

  async connect(deviceUuid: string): Promise<void> {
    if (this.state !== 'idle') return

    this.setState('connecting')

    this.ws = new WebSocket(this.wsUrl)

    this.ws.onopen = () => {
      this.send('start', { deviceUuid })
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data as string)
        this.handleMessage(msg)
      } catch {
        // ignore parse errors
      }
    }

    this.ws.onerror = () => {
      this.handler.onError('Connection failed')
      this.cleanup()
      this.setState('idle')
    }

    this.ws.onclose = (event) => {
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
    if (this.state === 'idle' || this.state === 'ending') return

    this.setState('ending')
    this.send('end', {})

    // Give the server a moment to send 'ended', then force cleanup
    setTimeout(() => {
      this.cleanup()
      this.setState('idle')
    }, 2000)
  }

  private handleMessage(msg: WsMessage): void {
    switch (msg.event) {
      case 'ready':
        this.startRecording()
        this.player = new AudioPlayer()
        this.setState('listening')
        break
      case 'audio':
        if (msg.data?.data) {
          if (this.state === 'listening') {
            this.setState('speaking')
          }
          this.player?.enqueue(msg.data.data as string)
        }
        break
      case 'interrupted':
        this.player?.interrupt()
        this.setState('listening')
        break
      case 'turn_complete':
        this.setState('listening')
        break
      case 'ended':
        this.cleanup()
        this.setState('idle')
        break
      case 'error':
        this.handler.onError((msg.data?.message as string) || 'Unknown error')
        break
    }
  }

  private async startRecording(): Promise<void> {
    this.recorder = new AudioRecorder()
    await this.recorder.start((base64) => {
      this.send('audio', { data: base64 })
    })
  }

  private send(event: string, data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    }
  }

  private cleanup(): void {
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
  }
}
