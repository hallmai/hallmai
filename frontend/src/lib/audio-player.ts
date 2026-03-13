export class AudioPlayer {
  private audioContext: AudioContext | null = null
  private nextStartTime = 0
  private sources: AudioBufferSourceNode[] = []

  private async ensureContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 })
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    return this.audioContext
  }

  async enqueue(base64: string): Promise<void> {
    const ctx = await this.ensureContext()

    const int16 = base64ToInt16(base64)
    const float32 = int16ToFloat32(int16)
    const buffer = ctx.createBuffer(1, float32.length, 24000)
    buffer.getChannelData(0).set(float32)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)

    // Schedule seamlessly: if nextStartTime is in the past, start now
    const now = ctx.currentTime
    if (this.nextStartTime < now) {
      this.nextStartTime = now
    }

    source.start(this.nextStartTime)
    this.nextStartTime += buffer.duration

    source.onended = () => {
      const idx = this.sources.indexOf(source)
      if (idx !== -1) this.sources.splice(idx, 1)
    }
    this.sources.push(source)
  }

  interrupt(): void {
    for (const source of this.sources) {
      try {
        source.stop()
      } catch {
        // already stopped
      }
    }
    this.sources = []
    this.nextStartTime = 0
  }

  destroy(): void {
    this.interrupt()
    this.audioContext?.close()
    this.audioContext = null
  }
}

function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Int16Array(bytes.buffer)
}

function int16ToFloat32(int16: Int16Array): Float32Array {
  const float32 = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff)
  }
  return float32
}
