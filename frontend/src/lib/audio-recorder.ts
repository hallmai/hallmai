export class AudioRecorder {
  private audioContext: AudioContext | null = null
  private stream: MediaStream | null = null
  private workletNode: AudioWorkletNode | null = null
  private onData: ((base64: string) => void) | null = null
  private onVolume: ((level: number) => void) | null = null

  async start(
    onData: (base64: string) => void,
    onVolume?: (level: number) => void,
  ): Promise<void> {
    this.onData = onData
    this.onVolume = onVolume ?? null

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    })

    this.audioContext = new AudioContext({ sampleRate: 16000 })
    await this.audioContext.audioWorklet.addModule('/audio-processor.js')

    const source = this.audioContext.createMediaStreamSource(this.stream)
    this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor')

    this.workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
      const float32 = event.data
      if (this.onVolume) {
        this.onVolume(rms(float32))
      }
      const int16 = float32ToInt16(float32)
      const base64 = arrayBufferToBase64(int16.buffer as ArrayBuffer)
      this.onData?.(base64)
    }

    source.connect(this.workletNode)
    this.workletNode.connect(this.audioContext.destination)
  }

  stop(): void {
    this.workletNode?.disconnect()
    this.workletNode = null
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.audioContext?.close()
    this.audioContext = null
    this.onData = null
    this.onVolume = null
  }
}

function rms(buf: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
  return Math.min(1, Math.sqrt(sum / buf.length) * 5)
}

function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
