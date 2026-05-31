// Web Audio API procedural ambient — no asset files needed.
// Brown noise (filtered white noise) gives a natural wind/atmosphere feel.
// All gains are very low; this is background texture, not music.

const STAGE_WIND: Record<string, { filterHz: number; gain: number }> = {
  grass_day:       { filterHz: 500,  gain: 0.28 },
  forest_evening:  { filterHz: 320,  gain: 0.36 },
  night_field:     { filterHz: 220,  gain: 0.44 },
}

function makeBrownNoise(ctx: AudioContext, seconds = 4): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * seconds
  const buf = ctx.createBuffer(1, length, sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  return buf
}

class AmbientAudioSystem {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private windGain: GainNode | null = null
  private currentStageId = ''
  initialized = false

  init(): void {
    if (this.initialized) return
    const Ctx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
    if (!Ctx) return

    this.ctx = new Ctx()
    const ctx = this.ctx

    // Master gain — very subtle
    this.master = ctx.createGain()
    this.master.gain.value = 0.1
    this.master.connect(ctx.destination)

    // Brown noise source (loops)
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = makeBrownNoise(ctx, 4)
    noiseSource.loop = true

    // Low-pass filter — shaped per stage
    this.windFilter = ctx.createBiquadFilter()
    this.windFilter.type = 'lowpass'
    this.windFilter.frequency.value = 500
    this.windFilter.Q.value = 0.6

    this.windGain = ctx.createGain()
    this.windGain.gain.value = 0.28

    noiseSource.connect(this.windFilter)
    this.windFilter.connect(this.windGain)
    this.windGain.connect(this.master)
    noiseSource.start()

    this.initialized = true

    // Apply current stage params if already set
    if (this.currentStageId) this.setStage(this.currentStageId)
  }

  setStage(stageId: string): void {
    this.currentStageId = stageId
    if (!this.ctx || !this.windFilter || !this.windGain) return

    const params = STAGE_WIND[stageId]
    if (!params) return

    const now = this.ctx.currentTime
    const RAMP = 1.8  // 1.8s crossfade — smooth, not jarring

    this.windFilter.frequency.linearRampToValueAtTime(params.filterHz, now + RAMP)
    this.windGain.gain.linearRampToValueAtTime(params.gain, now + RAMP)
  }

  // Call on visibilitychange or page blur
  suspend(): void {
    this.ctx?.suspend()
  }

  resume(): void {
    this.ctx?.resume()
  }
}

export const audioSystem = new AmbientAudioSystem()
