// audio.js — BGM + SE（Web Audio API / 外部ファイル不要）
var AudioFX = (function () {
  'use strict';

  var ctx       = null;
  var unlocked  = false;
  var bgmTimer  = null;
  var bgmScene  = null;
  var bgmBeat   = 0;

  // ── AudioContext 生成 ──────────────────────────────────
  function ac() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx;
    } catch (e) { return null; }
  }

  // ── モバイルブラウザ向けオーディオ解除 ────────────────
  // Promise を使わず同期的に処理する方式（タイミング問題を回避）
  function _unlock() {
    if (unlocked) return;
    var c = ac();
    if (!c) return;

    // resume() は呼ぶが Promise を待たない
    // （ユーザー操作内なので即座に running に移行するブラウザが多い）
    if (c.state !== 'running') {
      try { c.resume(); } catch (e) {}
    }

    // iOS Safari 完全解除：実際に極小音量のノートを鳴らす
    // サイレントバッファより確実に unlock される
    try {
      var osc = c.createOscillator();
      var g   = c.createGain();
      osc.frequency.value = 1;          // 人間に聞こえない低周波
      g.gain.setValueAtTime(0.001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.1);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.1);
    } catch (e) {}

    unlocked = true;
  }

  // ── すべてのイベントで解除を試みる ────────────────────
  // once: true は非対応ブラウザ対策で手動 removeEventListener
  function _unlockOnce(e) {
    _unlock();
    document.removeEventListener('touchstart', _unlockOnce);
    document.removeEventListener('touchend',   _unlockOnce);
    document.removeEventListener('click',      _unlockOnce);
    document.removeEventListener('keydown',    _unlockOnce);
  }
  document.addEventListener('touchstart', _unlockOnce);
  document.addEventListener('touchend',   _unlockOnce);
  document.addEventListener('click',      _unlockOnce);
  document.addEventListener('keydown',    _unlockOnce);

  // ── 汎用ノート再生（SE / BGM 共通） ───────────────────
  function note(freq, dur, vol, type, dest, startDelay) {
    var c = ac(); if (!c) return;
    // suspended のまま呼ばれた場合も resume を試みる
    if (c.state === 'suspended') { c.resume(); }
    var t = Math.max(c.currentTime, 0.001) + (startDelay || 0);
    var osc = c.createOscillator();
    var g   = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.setValueAtTime(vol, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(dest || c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  }

  // ══════════════════════════════════════════════════════
  //  BGM エンジン
  // ══════════════════════════════════════════════════════

  /*
   * 各シーンの設定
   *   notes   : 使用音の周波数配列（Hz）
   *   pattern : notes のインデックス配列（-1 = 休符）
   *   tempo   : 1拍の長さ（ms）
   *   vol     : ノート音量
   *   bass    : ベース音量（0 でなし）
   */
  var SCENES = {
    home: {
      notes:   [261.63, 329.63, 392.00, 523.25, 659.25], // C E G C5 E5
      pattern: [0, 2, 4, 3, 1, 3, 2, -1],
      tempo:   510, vol: 0.055, bass: 0.028
    },
    experiment: {
      notes:   [329.63, 392.00, 440.00, 493.88, 587.33], // E G A B D
      pattern: [0, 2, 4, 3, 4, 1, 2, 0],
      tempo:   355, vol: 0.065, bass: 0.030
    },
    gallery: {
      notes:   [392.00, 440.00, 493.88, 587.33, 659.25], // G A B D E
      pattern: [0, 1, 3, 4, 3, 2, 0, -1],
      tempo:   620, vol: 0.048, bass: 0.022
    },
    carddetail: {
      notes:   [220.00, 261.63, 329.63, 392.00, 440.00], // A3 C E G A4
      pattern: [2, 4, 3, 1, 0, 2, 3, -1],
      tempo:   530, vol: 0.042, bass: 0.018
    }
  };

  var bgm = {
    start: function (scene) {
      if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
      bgmScene = scene;
      bgmBeat  = 0;
      var cfg = SCENES[scene];
      var c = ac();
      if (!cfg || !c) return;
      // suspended ならここでも解除を試みる
      if (c.state === 'suspended') c.resume();

      var len = cfg.pattern.length;
      function tick() {
        if (bgmScene !== scene) return;
        var idx = cfg.pattern[bgmBeat % len];
        if (idx >= 0) {
          note(cfg.notes[idx], cfg.tempo / 1000 * 0.82, cfg.vol);
        }
        // 1拍目・5拍目にベース
        var beat = bgmBeat % len;
        if ((beat === 0 || beat === 4) && cfg.bass > 0) {
          note(cfg.notes[0] * 0.5, cfg.tempo / 1000 * 1.3, cfg.bass);
        }
        bgmBeat++;
      }
      tick();
      bgmTimer = setInterval(tick, cfg.tempo);
    },

    stop: function () {
      if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
      bgmScene = null;
    }
  };

  // ══════════════════════════════════════════════════════
  //  SE ― ボタン類
  // ══════════════════════════════════════════════════════

  // 一般ボタン（柔らかいポップ）
  function playButton() {
    note(500, 0.08, 0.11);
    note(700, 0.07, 0.06, 'sine', null, 0.04);
  }

  // 前進ボタン（3音上昇）
  function playBtnForward() {
    [440, 554, 659].forEach(function (f, i) {
      note(f, 0.11, 0.10, 'sine', null, i * 0.055);
    });
  }

  // 戻るボタン（2音下降）
  function playBtnBack() {
    note(440, 0.12, 0.10);
    note(330, 0.14, 0.08, 'sine', null, 0.07);
  }

  // 言語トグル（2音チャイム）
  function playBtnToggle() {
    note(523, 0.10, 0.09);
    note(659, 0.12, 0.07, 'sine', null, 0.08);
  }

  // 図鑑カードタップ（高音キラキラ）
  function playCardTap() {
    [1047, 1319, 1568].forEach(function (f, i) {
      note(f, 0.22, 0.07, 'sine', null, i * 0.045);
    });
  }

  // ══════════════════════════════════════════════════════
  //  SE ― ゲーム内
  // ══════════════════════════════════════════════════════

  // 素材挿入（短い上昇ポップ）
  function playInsert() {
    var c = ac(); if (!c) return;
    var t = c.currentTime;
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.09);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + 0.14);
  }

  // まぜまぜ中キラキラ（progressで音高変化）
  function playSparkle(progress) {
    var base = 700 + progress * 1200;
    [1.00, 1.26, 1.50].forEach(function (r, i) {
      var f = base * r * (1 + (Math.random() - 0.5) * 0.06);
      note(f, 0.26, 0.07 / (i + 1), 'sine', null, 0);
    });
  }

  // 完成音（上昇アルペジオ＋余韻）
  function playComplete() {
    var c = ac(); if (!c) return;
    // 5音上昇
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function (f, i) {
      note(f, 0.72, 0.17, 'sine', null, i * 0.09);
    });
    // 高音余韻
    [2093, 2637].forEach(function (f, i) {
      note(f, 1.3, 0.08, 'sine', null, 0.44 + i * 0.06);
    });
  }

  // ══════════════════════════════════════════════════════
  return {
    bgm:            bgm,
    playButton:     playButton,
    playBtnForward: playBtnForward,
    playBtnBack:    playBtnBack,
    playBtnToggle:  playBtnToggle,
    playCardTap:    playCardTap,
    playInsert:     playInsert,
    playSparkle:    playSparkle,
    playComplete:   playComplete
  };
})();
