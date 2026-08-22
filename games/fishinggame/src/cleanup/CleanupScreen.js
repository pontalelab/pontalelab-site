/** 「うみをそうじする」モードの Canvas 描画 */

import { CLEANUP_CANVAS_W, CLEANUP_CANVAS_H } from "./CleanupState.js";
import { cleanupStages } from "./CleanupStageMaster.js";

const BG_COLORS_BY_LEVEL = {
  1: { top: "#050e1a", mid: "#0a1a30", bottom: "#0a1a28" },
  2: { top: "#081828", mid: "#0a3060", bottom: "#0a2848" },
  3: { top: "#061830", mid: "#0a4070", bottom: "#0a3860" },
};

export class CleanupScreen {
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._bubbles = _createBubbles(25);
    this._bgImages = { 1: null, 2: null, 3: null };
    this._loadBackgrounds();
  }

  resize() {
    this._canvas.width = CLEANUP_CANVAS_W;
    this._canvas.height = CLEANUP_CANVAS_H;
  }

  _loadBackgrounds() {
    for (let level = 1; level <= 3; level++) {
      const img = new Image();
      img.onload = () => { this._bgImages[level] = img; };
      img.onerror = () => { this._bgImages[level] = null; };
      img.src = `assets/backgrounds/bg_level${level}.png`;
    }
  }

  render(state) {
    const ctx = this._ctx;
    ctx.clearRect(0, 0, CLEANUP_CANVAS_W, CLEANUP_CANVAS_H);

    _drawBackground(ctx, state.stage.bgLevel, state.elapsedTime, this._bgImages);
    _updateAndDrawBubbles(ctx, this._bubbles, state.elapsedTime);

    for (const trash of state.activeTrashList) _drawTrash(ctx, trash);
    for (const fish of state.activeFishList) _drawFish(ctx, fish);

    _drawParticles(ctx, state.particles);
  }

  /** クライアント座標 → キャンバス論理座標 */
  toCanvasCoords(clientX, clientY) {
    const rect = this._canvas.getBoundingClientRect();
    const scaleX = CLEANUP_CANVAS_W / rect.width;
    const scaleY = CLEANUP_CANVAS_H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }
}

/* ======= 背景 ======= */

function _drawBackground(ctx, level, t, bgImages) {
  const img = bgImages[level];
  const hasImage = img && img.complete && img.naturalWidth > 0;

  if (hasImage) {
    _drawImageCover(ctx, img, CLEANUP_CANVAS_W, CLEANUP_CANVAS_H);
    _drawWaveLines(ctx, t, 0.07);
  } else {
    _drawGradientBg(ctx, level, t);
    _drawWaveLines(ctx, t, 0.15);
  }

  if (level >= 3) _drawLightRays(ctx, t, hasImage ? 0.05 : 0.08);
}

function _drawImageCover(ctx, img, w, h) {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = w / h;
  let sx, sy, sw, sh;
  if (imgAspect > canvasAspect) {
    sh = img.naturalHeight;
    sw = sh * canvasAspect;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / canvasAspect;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

function _drawGradientBg(ctx, level, t) {
  const c = BG_COLORS_BY_LEVEL[level] ?? BG_COLORS_BY_LEVEL[1];
  const grad = ctx.createLinearGradient(0, 0, 0, CLEANUP_CANVAS_H);
  grad.addColorStop(0, c.top);
  grad.addColorStop(0.5, c.mid);
  grad.addColorStop(1, c.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CLEANUP_CANVAS_W, CLEANUP_CANVAS_H);
}

function _drawWaveLines(ctx, t, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#8df";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const yBase = 52 + i * 9;
    for (let x = 0; x <= CLEANUP_CANVAS_W; x += 6) {
      const y = yBase + Math.sin(x / 55 + t * 1.5 + i * 1.1) * 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function _drawLightRays(ctx, t, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 5; i++) {
    const x = ((t * 35 + i * 165) % (CLEANUP_CANVAS_W + 120)) - 60;
    const grad = ctx.createLinearGradient(x, 0, x + 45, CLEANUP_CANVAS_H * 0.65);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.3, "#aff");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, 45, CLEANUP_CANVAS_H * 0.65);
  }
  ctx.restore();
}

/* ======= 泡 ======= */

function _createBubbles(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * CLEANUP_CANVAS_W,
    y: Math.random() * CLEANUP_CANVAS_H,
    r: 1 + Math.random() * 4,
    speed: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
  }));
}

function _updateAndDrawBubbles(ctx, bubbles, t) {
  ctx.save();
  for (const b of bubbles) {
    b.y -= b.speed * 0.5;
    if (b.y < -10) { b.y = CLEANUP_CANVAS_H + 10; b.x = Math.random() * CLEANUP_CANVAS_W; }
    const alpha = 0.08 + 0.12 * Math.sin(t * 2 + b.phase);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#8df";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* ======= ゴミ ======= */

function _drawTrash(ctx, entity) {
  if (!entity.active) return;
  const cx = entity.x + entity.size.width / 2;
  const cy = entity.y + entity.size.height / 2 + (entity.wobbleOffset ?? 0);
  const fontSize = Math.max(20, Math.min(entity.size.width, entity.size.height) * 0.75);

  ctx.save();
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // タップしやすいことが伝わるよう、うっすら光る円を敷く
  ctx.beginPath();
  ctx.arc(cx, cy, fontSize * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fill();
  // fillStyle の透明度が絵文字の描画にも引き継がれてしまうため、
  // 絵文字本体は不透明な色に戻してから描画する
  ctx.fillStyle = "#000";
  ctx.fillText(entity.emoji, cx, cy);
  ctx.restore();
}

/* ======= 魚 ======= */

function _drawFish(ctx, entity) {
  if (!entity.active) return;
  const cx = entity.x + entity.size.width / 2;
  const cy = entity.y + entity.size.height / 2;
  const fontSize = Math.max(18, Math.min(entity.size.width, entity.size.height) * 0.7);
  const flip = (entity.direction ?? 1) < 0;

  ctx.save();
  ctx.translate(cx, cy);
  if (flip) ctx.scale(-1, 1);
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(entity.emoji, 0, 0);
  ctx.restore();
}

/* ======= パーティクル ======= */

function _drawParticles(ctx, particles) {
  ctx.save();
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ======= HUD（DOM）更新 ======= */

export function updateCleanupHUD(state) {
  const remainEl = document.getElementById("cleanup-remaining-badge");
  if (remainEl) remainEl.textContent = `🗑️ のこり ${state.remaining} こ`;

  const stageEl = document.getElementById("cleanup-stage-badge");
  if (stageEl) stageEl.textContent = `🌊 ${state.stage.name}`;

  const max = state.maxTrash;
  const progressBar = document.getElementById("cleanup-progress-bar");
  if (progressBar) {
    const pct = Math.round(((max - state.remaining) / max) * 100);
    progressBar.style.width = `${pct}%`;
  }

  const timerEl = document.getElementById("cleanup-timer-display");
  if (timerEl) {
    const secs = Math.ceil(state.timeLeft);
    timerEl.textContent = secs;
    timerEl.classList.toggle("urgent", secs <= 10);
  }

  const comboEl = document.getElementById("cleanup-combo-badge");
  if (comboEl) {
    if (state.comboStep > 0) {
      comboEl.textContent = `🎵 コンボ ${state.comboStep}`;
      comboEl.classList.add("show");
    } else {
      comboEl.classList.remove("show");
    }
  }
}

export { cleanupStages };
