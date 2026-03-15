export class AudioRecorder {
  private audioContext: AudioContext | null = null
  private stream: MediaStream | null = null
  private workletNode: AudioWorkletNode | null = null
  private rnnoiseNode: (AudioWorkletNode & { destroy(): void }) | null = null
  private onData: ((base64: string) => void) | null = null
  private onVolume: ((level: number) => void) | null = null
  private resampleRemainder = new Float32Array(0)

  async start(
    onData: (base64: string) => void,
    onVolume?: (level: number) => void,
  ): Promise<void> {
    this.onData = onData
    this.onVolume = onVolume ?? null
    this.resampleRemainder = new Float32Array(0)

    const useRnnoise =
      typeof window !== 'undefined' &&
      localStorage.getItem('noiseSuppression') === 'rnnoise'
    try {
      if (!useRnnoise) throw new Error('RNNoise disabled')
      await this.startWithRnnoise()
    } catch (e) {
      if (useRnnoise) console.warn('RNNoise init failed, falling back', e)
      this.cleanup()
      await this.startDirect()
    }
  }

  private async startWithRnnoise(): Promise<void> {
    const { loadRnnoise, RnnoiseWorkletNode } = await import(
      '@sapphi-red/web-noise-suppressor'
    )

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 48000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: false,
      },
    })

    this.audioContext = new AudioContext({ sampleRate: 48000 })
    await this.audioContext.resume()

    const wasmBinary = await loadRnnoise({
      url: '/rnnoise/rnnoise.wasm',
      simdUrl: '/rnnoise/rnnoise_simd.wasm',
    })
    await this.audioContext.audioWorklet.addModule('/rnnoise/workletProcessor.js')
    await this.audioContext.audioWorklet.addModule('/audio-processor.js')

    const source = this.audioContext.createMediaStreamSource(this.stream)

    this.rnnoiseNode = new RnnoiseWorkletNode(this.audioContext, {
      maxChannels: 1,
      wasmBinary,
    })
    this.rnnoiseNode.onprocessorerror = (e) => {
      console.error('[RNNoise] Worklet processor error:', e)
    }

    this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor')

    this.workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
      const float32 = event.data
      if (this.onVolume) {
        this.onVolume(rmsDisplay(float32))
      }
      const downsampled = this.downsample48to16(float32)
      if (downsampled.length === 0) return
      const int16 = float32ToInt16(downsampled)
      const base64 = arrayBufferToBase64(int16.buffer as ArrayBuffer)
      this.onData?.(base64)
    }

    source.connect(this.rnnoiseNode)
    this.rnnoiseNode.connect(this.workletNode)
    this.workletNode.connect(this.audioContext.destination)
    console.log('[AudioRecorder] RNNoise active (48kHz)')
  }

  private async startDirect(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    })

    this.audioContext = new AudioContext({ sampleRate: 16000 })
    await this.audioContext.resume()
    await this.audioContext.audioWorklet.addModule('/audio-processor.js')

    const source = this.audioContext.createMediaStreamSource(this.stream)
    this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor')

    this.workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
      const float32 = event.data
      if (this.onVolume) {
        this.onVolume(rmsDisplay(float32))
      }
      const int16 = float32ToInt16(float32)
      const base64 = arrayBufferToBase64(int16.buffer as ArrayBuffer)
      this.onData?.(base64)
    }

    source.connect(this.workletNode)
    this.workletNode.connect(this.audioContext.destination)
    console.log('[AudioRecorder] Direct passthrough (16kHz)')
  }

  private downsample48to16(input: Float32Array): Float32Array {
    const combined = new Float32Array(
      this.resampleRemainder.length + input.length,
    )
    combined.set(this.resampleRemainder)
    combined.set(input, this.resampleRemainder.length)

    const outputLen = Math.floor(combined.length / 3)
    if (outputLen === 0) {
      this.resampleRemainder = combined
      return new Float32Array(0)
    }
    const output = new Float32Array(outputLen)
    for (let i = 0; i < outputLen; i++) {
      const idx = i * 3
      output[i] = (combined[idx] + combined[idx + 1] + combined[idx + 2]) / 3
    }
    this.resampleRemainder = combined.slice(outputLen * 3)
    return output
  }

  private cleanup(): void {
    if (this.rnnoiseNode) {
      this.rnnoiseNode.disconnect()
      this.rnnoiseNode.destroy()
      this.rnnoiseNode = null
    }
    this.workletNode?.disconnect()
    this.workletNode = null
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.audioContext?.close()
    this.audioContext = null
  }

  stop(): void {
    this.cleanup()
    this.onData = null
    this.onVolume = null
    this.resampleRemainder = new Float32Array(0)
  }
}

function rmsDisplay(buf: Float32Array): number {
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
