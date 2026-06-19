/** Web Audio API を使ったサウンド管理 */

export class AudioManager {
  constructor() {
    this._ctx = null;
    this._bgmNode = null;
    this._bgmGain = null;
    this._masterGain = null;
    this._bgmVolume = 0.35;
    this._sfxVolume = 0.6;
    this._currentBgm = null;
    this._bgmInterval = null;
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = 1;
      this._masterGain.connect(this._ctx.destination);
    }
    return this._ctx;
  }

  /** 効果音を再生する */
  play(soundName) {
    try {
      const ctx = this._getCtx();
      switch (soundName) {
        case "splash":   this._playSplash(ctx);   break;
        case "pop":      this._playPop(ctx);      break;
        case "sparkle":  this._playSparkle(ctx);  break;
        case "treasure": this._playTreasure(ctx); break;
        default:         this._playSplash(ctx);
      }
    } catch { /* AudioContext が使えない環境でも続行 */ }
  }

  _beep(ctx, freq, start, dur, type = "sine", vol = 0.3) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(vol * this._sfxVolume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(start);
    osc.stop(start + dur);
  }

  _playSplash(ctx) {
    const t = ctx.currentTime;
    this._beep(ctx, 800, t, 0.08, "triangle", 0.25);
    this._beep(ctx, 500, t + 0.04, 0.1, "triangle", 0.15);
  }

  _playPop(ctx) {
    const t = ctx.currentTime;
    this._beep(ctx, 600, t, 0.06, "sine", 0.3);
    this._beep(ctx, 900, t + 0.03, 0.08, "sine", 0.2);
  }

  _playSparkle(ctx) {
    const t = ctx.currentTime;
    [880, 1100, 1320, 1760].forEach((f, i) => {
      this._beep(ctx, f, t + i * 0.07, 0.15, "sine", 0.25);
    });
  }

  _playTreasure(ctx) {
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => this._beep(ctx, f, t + i * 0.12, 0.25, "sine", 0.3));
  }

  /** BGMを開始する */
  startBgm(type) {
    this._currentBgm = type;
    this._startBgmLoop(type);
  }

  stopBgm() {
    if (this._bgmInterval) {
      clearInterval(this._bgmInterval);
      this._bgmInterval = null;
    }
    this._stopBgmNode();
    this._currentBgm = null;
  }

  changeBgm(type) {
    this.stopBgm();
    this.startBgm(type);
  }

  _stopBgmNode() {
    try {
      if (this._bgmNode) {
        this._bgmNode.stop();
        this._bgmNode = null;
      }
    } catch { /* ignore */ }
  }

  _startBgmLoop(type) {
    const notes = type === "special"
      ? [523, 659, 784, 659, 523, 440, 523, 0]
      : [261, 329, 392, 329, 261, 220, 261, 0];

    let i = 0;
    const playNext = () => {
      try {
        const ctx = this._getCtx();
        const freq = notes[i % notes.length];
        if (freq > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(this._bgmVolume * 0.5, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          osc.connect(gain);
          gain.connect(this._masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
        i++;
      } catch { /* ignore */ }
    };

    playNext();
    this._bgmInterval = setInterval(playNext, 500);
  }

  setBgmVolume(v)  { this._bgmVolume = Math.max(0, Math.min(1, v)); }
  setSfxVolume(v)  { this._sfxVolume = Math.max(0, Math.min(1, v)); }
}
