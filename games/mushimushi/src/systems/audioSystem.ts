const BASE_URL = import.meta.env.BASE_URL
const BGM_VOLUME = 0.6
const FADE_STEPS = 25
const FADE_MS = 40  // 25 steps × 40ms = 1s fade

class BgmAudioSystem {
  private current: HTMLAudioElement | null = null
  private currentStageId = ''
  initialized = false

  init(): void {
    if (this.initialized) return
    this.initialized = true
    if (this.currentStageId) this._play(this.currentStageId)
  }

  setStage(stageId: string): void {
    // Same stage already playing → skip
    if (stageId === this.currentStageId && this.current && !this.current.paused) return
    this.currentStageId = stageId
    if (!this.initialized) return
    this._play(stageId)
  }

  private _play(stageId: string): void {
    const prev = this.current
    if (prev) this._fadeOut(prev)

    const audio = new Audio(`${BASE_URL}bgm/${stageId}.mp3`)
    audio.loop = true
    audio.volume = 0
    this.current = audio
    audio.play().catch(() => {})
    this._fadeIn(audio)
  }

  private _fadeOut(audio: HTMLAudioElement): void {
    const startVol = audio.volume
    let step = 0
    const timer = setInterval(() => {
      step++
      audio.volume = Math.max(0, startVol * (1 - step / FADE_STEPS))
      if (step >= FADE_STEPS) {
        clearInterval(timer)
        audio.pause()
      }
    }, FADE_MS)
  }

  private _fadeIn(audio: HTMLAudioElement): void {
    let step = 0
    const timer = setInterval(() => {
      step++
      audio.volume = Math.min(BGM_VOLUME, BGM_VOLUME * (step / FADE_STEPS))
      if (step >= FADE_STEPS) clearInterval(timer)
    }, FADE_MS)
  }

  suspend(): void {
    this.current?.pause()
  }

  resume(): void {
    if (this.current && this.current.paused) {
      this.current.play().catch(() => {})
    }
  }
}

export const audioSystem = new BgmAudioSystem()
