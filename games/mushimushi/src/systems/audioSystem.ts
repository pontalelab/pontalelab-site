import { getReadyAudioUrl, loadAudioUrl } from './obfuscatedAudio'

const BASE_URL = import.meta.env.BASE_URL
// VSQ plus+ の規約（オリジナル状態での再配信禁止）に合わせ、変換・難読化した .dat を復号して再生する
const bgmUrl = (stageId: string) => `${BASE_URL}bgm/${stageId}.dat`
const BGM_VOLUME = 0.6
const FADE_STEPS = 25
const FADE_MS = 40  // 25 steps × 40ms = 1s fade

class BgmAudioSystem {
  private current: HTMLAudioElement | null = null
  private currentStageId = ''
  // 再生を試みたがブラウザに止められた（読み込みが操作に間に合わなかった等）状態。次のタップで再試行する
  private pendingPlay = false
  initialized = false

  init(): void {
    if (this.initialized) return
    this.initialized = true
    document.addEventListener('pointerdown', () => {
      if (this.pendingPlay && !document.hidden) this._tryPlay()
    })
    if (this.currentStageId) this._play(this.currentStageId)
  }

  setStage(stageId: string): void {
    // Same stage already playing → skip
    if (stageId === this.currentStageId && this.current && !this.current.paused) return
    this.currentStageId = stageId
    loadAudioUrl(bgmUrl(stageId)).catch(() => {}) // 先読み
    if (!this.initialized) return
    this._play(stageId)
  }

  private _play(stageId: string): void {
    const prev = this.current
    if (prev) this._fadeOut(prev)

    const audio = new Audio()
    audio.loop = true
    audio.volume = 0
    this.current = audio
    const url = bgmUrl(stageId)
    const readyUrl = getReadyAudioUrl(url)
    if (readyUrl) {
      audio.src = readyUrl
      this._tryPlay()
    } else {
      this.pendingPlay = true
      loadAudioUrl(url)
        .then((src) => {
          if (this.current !== audio) return
          audio.src = src
          if (this.pendingPlay && !document.hidden) this._tryPlay()
        })
        .catch(() => {})
    }
    this._fadeIn(audio)
  }

  private _tryPlay(): void {
    const audio = this.current
    if (!audio || !audio.src) return
    this.pendingPlay = true
    audio
      .play()
      .then(() => {
        if (this.current === audio) this.pendingPlay = false
      })
      .catch(() => {})
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
    this.pendingPlay = false
    this.current?.pause()
  }

  resume(): void {
    if (this.current && this.current.paused) this._tryPlay()
  }
}

export const audioSystem = new BgmAudioSystem()
