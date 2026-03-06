/**
 * 소리 기반 코드 전송
 * 6자리 연결 코드를 오디오 톤 시퀀스로 인코딩/디코딩
 *
 * 인코딩: 각 문자 → 고유 주파수 톤
 * - 프리앰블: 1200Hz + 1400Hz (시작 신호)
 * - 문자: BASE_FREQ + charIndex * STEP
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BASE_FREQ = 1800;
const STEP = 80;
const PREAMBLE_FREQS = [1200, 1400];
const TONE_DURATION = 0.15; // 150ms
const GAP_DURATION = 0.05; // 50ms
const SLOT = TONE_DURATION + GAP_DURATION; // 200ms per char

function charToFreq(char: string): number {
  const idx = CHARS.indexOf(char);
  if (idx === -1) throw new Error(`Invalid char: ${char}`);
  return BASE_FREQ + idx * STEP;
}

function freqToChar(freq: number): string | null {
  const idx = Math.round((freq - BASE_FREQ) / STEP);
  if (idx < 0 || idx >= CHARS.length) return null;
  // 허용 오차: STEP의 40%
  if (Math.abs(freq - (BASE_FREQ + idx * STEP)) > STEP * 0.4) return null;
  return CHARS[idx];
}

// === 송신 (시니어 측) ===

export class SoundTransmitter {
  private ctx: AudioContext | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async start(code: string) {
    this.ctx = new AudioContext();
    await this.transmit(code);
    // 3초 간격으로 반복 송신
    this.intervalId = setInterval(() => this.transmit(code), 3000);
  }

  private async transmit(code: string) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    let time = ctx.currentTime + 0.05;

    // 프리앰블
    for (const freq of PREAMBLE_FREQS) {
      this.playTone(ctx, freq, time, TONE_DURATION);
      time += SLOT;
    }

    // 코드 문자들
    for (const char of code) {
      this.playTone(ctx, charToFreq(char), time, TONE_DURATION);
      time += SLOT;
    }
  }

  private playTone(ctx: AudioContext, freq: number, startTime: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gain.gain.setValueAtTime(0.3, startTime + duration - 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// === 수신 (자녀 측) ===

export class SoundReceiver {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private running = false;
  private onCode: ((code: string) => void) | null = null;

  async start(onCode: (code: string) => void) {
    this.onCode = onCode;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.ctx = new AudioContext();
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 4096;
    source.connect(this.analyser);
    this.running = true;
    this.listen();
  }

  private listen() {
    if (!this.running || !this.analyser || !this.ctx) return;

    const analyser = this.analyser;
    const sampleRate = this.ctx.sampleRate;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    const freqResolution = sampleRate / analyser.fftSize;

    let state: "idle" | "preamble1" | "preamble2" | "reading" = "idle";
    let decoded: string[] = [];
    let silenceCount = 0;
    let lastDetectTime = 0;

    const detect = () => {
      if (!this.running) return;
      analyser.getFloatFrequencyData(dataArray);

      // 피크 주파수 찾기
      const peak = this.findPeakFrequency(dataArray, freqResolution);
      const now = Date.now();

      if (peak === null || peak.power < -40) {
        silenceCount++;
        if (silenceCount > 15 && state !== "idle") {
          // 긴 침묵 → 리셋
          state = "idle";
          decoded = [];
        }
        requestAnimationFrame(detect);
        return;
      }

      silenceCount = 0;

      // 중복 감지 방지 (최소 100ms 간격)
      if (now - lastDetectTime < 100) {
        requestAnimationFrame(detect);
        return;
      }

      const freq = peak.freq;

      if (state === "idle") {
        if (Math.abs(freq - PREAMBLE_FREQS[0]) < 50) {
          state = "preamble1";
          lastDetectTime = now;
        }
      } else if (state === "preamble1") {
        if (Math.abs(freq - PREAMBLE_FREQS[1]) < 50) {
          state = "reading";
          decoded = [];
          lastDetectTime = now;
        } else if (Math.abs(freq - PREAMBLE_FREQS[0]) > 50) {
          state = "idle";
        }
      } else if (state === "reading") {
        const char = freqToChar(freq);
        if (char) {
          decoded.push(char);
          lastDetectTime = now;
          if (decoded.length === 6) {
            const code = decoded.join("");
            this.onCode?.(code);
            state = "idle";
            decoded = [];
          }
        }
      }

      requestAnimationFrame(detect);
    };

    detect();
  }

  private findPeakFrequency(
    data: Float32Array,
    freqResolution: number
  ): { freq: number; power: number } | null {
    // 1000Hz ~ 5000Hz 범위에서 피크 찾기
    const minBin = Math.floor(1000 / freqResolution);
    const maxBin = Math.ceil(5000 / freqResolution);

    let maxPower = -Infinity;
    let maxBinIdx = -1;

    for (let i = minBin; i <= maxBin && i < data.length; i++) {
      if (data[i] > maxPower) {
        maxPower = data[i];
        maxBinIdx = i;
      }
    }

    if (maxBinIdx === -1) return null;

    return {
      freq: maxBinIdx * freqResolution,
      power: maxPower,
    };
  }

  stop() {
    this.running = false;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
