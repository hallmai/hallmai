export class AudioPlayer {
  private audioContext: AudioContext | null = null
  private queue: AudioBuffer[] = []
  private currentSource: AudioBufferSourceNode | null = null
  private isPlaying = false

  private ensureContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 })
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    return this.audioContext
  }

  enqueue(base64: string): void {
    const ctx = this.ensureContext()

    const int16 = base64ToInt16(base64)
    const float32 = int16ToFloat32(int16)
    const buffer = ctx.createBuffer(1, float32.length, 24000)
    buffer.getChannelData(0).set(float32)

    this.queue.push(buffer)
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  interrupt(): void {
    this.queue = []
    if (this.currentSource) {
      try {
        this.currentSource.stop()
      } catch {
        // already stopped
      }
      this.currentSource = null
    }
    this.isPlaying = false
  }

  destroy(): void {
    this.interrupt()
    this.audioContext?.close()
    this.audioContext = null
  }

  private playNext(): void {
    if (!this.audioContext || this.queue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true
    const buffer = this.queue.shift()!

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)

    source.onended = () => {
      this.currentSource = null
      this.playNext()
    }

    this.currentSource = source
    source.start()
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
