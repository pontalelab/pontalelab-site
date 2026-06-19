/** Canvas ゲーム描画モジュール */

import { stageMaster } from "../data/stageMaster.js";

export const CANVAS_W = 800;
export const CANVAS_H = 500;

/** レアリティ別グロー色 */
const RARITY_GLOW = {
  common:    null,
  uncommon:  "rgba(100,255,100,0.6)",
  rare:      "rgba(255,220,50,0.8)",
  superRare: "rgba(255,100,255,0.9)",
};

export class GameScreen {
  constructor(canvas) {
    this._canvas  = canvas;
    this._ctx     = canvas.getContext("2d");
    this._bubbles = _createBubbles(25);
    this._bgImages = { 1: null, 2: null, 3: null };
    this._loadBackgrounds();
  }

  /** キャンバスサイズをセットする（CSS での拡縮は style で行う） */
  resize() {
    this._canvas.width  = CANVAS_W;
    this._canvas.height = CANVAS_H;
  }

  /** 背景画像を非同期ロード */
  _loadBackgrounds() {
    for (let level = 1; level <= 3; level++) {
      const img = new Image();
      img.onload = () => { this._bgImages[level] = img; };
      img.onerror = () => { this._bgImages[level] = null; }; // 読み込み失敗時はグラデーション fallback
      img.src = `assets/backgrounds/bg_level${level}.png`;
    }
  }

  /** ゲーム状態全体を1フレーム描画する */
  render(state) {
    const ctx = this._ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const level = state.currentSeaLevel;
    const cfg   = stageMaster.levels.find(l => l.level === level) ?? stageMaster.levels[0];

    _drawBackground(ctx, cfg, state.elapsedTime, this._bgImages);
    _updateAndDrawBubbles(ctx, this._bubbles, state.elapsedTime);

    for (const entity of state.activeTrashList) _drawEntity(ctx, entity, state.elapsedTime);
    for (const entity of state.activeFishList)  _drawEntity(ctx, entity, state.elapsedTime);

    _drawParticles(ctx, state.particles);
    _drawNet(ctx, state.netPosition, state.netRadius, state.elapsedTime);
  }

  /** クライアント座標 → キャンバス論理座標 */
  toCanvasCoords(clientX, clientY) {
    const rect   = this._canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  }
}

/* ======= 背景描画 ======= */

function _drawBackground(ctx, levelConfig, t, bgImages) {
  const img = bgImages[levelConfig.level];
  const hasImage = img && img.complete && img.naturalWidth > 0;

  if (hasImage) {
    _drawImageCover(ctx, img, CANVAS_W, CANVAS_H);
    // 画像の上に薄いオーバーレイ（水面の揺れアニメ）
    _drawWaveLines(ctx, t, 0.07);
  } else {
    // フォールバック：プロシージャルグラデーション
    _drawGradientBg(ctx, levelConfig, t);
    _drawSeaFloor(ctx, levelConfig.level, t);
    _drawWaveLines(ctx, t, 0.15);
  }

  // Lv3以上：光の筋（画像あり時は薄く）
  if (levelConfig.level >= 3) {
    _drawLightRays(ctx, t, hasImage ? 0.05 : 0.08);
  }
}

/** カバー比率で画像をキャンバス全体に描く */
function _drawImageCover(ctx, img, w, h) {
  const imgAspect    = img.naturalWidth / img.naturalHeight;
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

/** グラデーション背景（フォールバック） */
function _drawGradientBg(ctx, levelConfig, t) {
  const c    = levelConfig.bgColors;
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0,   c.top);
  grad.addColorStop(0.5, c.mid);
  grad.addColorStop(1,   c.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

/** 海面の波ライン */
function _drawWaveLines(ctx, t, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#8df";
  ctx.lineWidth   = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const yBase = 52 + i * 9;
    for (let x = 0; x <= CANVAS_W; x += 6) {
      const y = yBase + Math.sin((x / 55) + t * 1.5 + i * 1.1) * 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** 光の筋（Lv3） */
function _drawLightRays(ctx, t, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 5; i++) {
    const x = ((t * 35 + i * 165) % (CANVAS_W + 120)) - 60;
    const grad = ctx.createLinearGradient(x, 0, x + 45, CANVAS_H * 0.65);
    grad.addColorStop(0,   "transparent");
    grad.addColorStop(0.3, "#aff");
    grad.addColorStop(1,   "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, 45, CANVAS_H * 0.65);
  }
  ctx.restore();
}

/** 海底（フォールバック時） */
function _drawSeaFloor(ctx, level, t) {
  const floorY  = CANVAS_H - 55;
  const topClr  = level === 1 ? "#1a1a10" : level === 2 ? "#2a2a18" : "#3a3020";
  const btmClr  = level === 1 ? "#0a0a08" : level === 2 ? "#181810" : "#201e18";
  const sandGrad = ctx.createLinearGradient(0, floorY, 0, CANVAS_H);
  sandGrad.addColorStop(0, topClr);
  sandGrad.addColorStop(1, btmClr);
  ctx.fillStyle = sandGrad;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  for (let x = 0; x <= CANVAS_W; x += 20) {
    ctx.lineTo(x, floorY + Math.sin(x / 40 + t * 0.3) * 5);
  }
  ctx.lineTo(CANVAS_W, CANVAS_H);
  ctx.lineTo(0, CANVAS_H);
  ctx.closePath();
  ctx.fill();

  if (level >= 2) {
    [60, 200, 380, 520, 680, 760].forEach(cx => _drawCoralSilhouette(ctx, cx, floorY, level, t));
  }
}

function _drawCoralSilhouette(ctx, x, floorY, level, t) {
  const palette = level === 2
    ? ["rgba(100,40,40,0.7)", "rgba(60,60,100,0.6)"]
    : ["rgba(200,60,60,0.6)", "rgba(60,130,200,0.5)", "rgba(200,160,50,0.5)"];
  ctx.save();
  ctx.fillStyle = palette[Math.floor(x / 150) % palette.length];
  const h = 20 + (x % 3) * 10;
  ctx.beginPath();
  ctx.moveTo(x, floorY + 2);
  for (let i = 0; i < 5; i++) {
    const bx = x + (i - 2) * 7;
    const by = floorY - h + Math.sin(t * 0.8 + i) * 2;
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + 4, by - 8);
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(x + 12, floorY + 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ======= 泡 ======= */

function _createBubbles(count) {
  return Array.from({ length: count }, () => ({
    x:     Math.random() * CANVAS_W,
    y:     Math.random() * CANVAS_H,
    r:     1 + Math.random() * 4,
    speed: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
  }));
}

function _updateAndDrawBubbles(ctx, bubbles, t) {
  ctx.save();
  for (const b of bubbles) {
    b.y -= b.speed * 0.5;
    if (b.y < -10) { b.y = CANVAS_H + 10; b.x = Math.random() * CANVAS_W; }
    const alpha = 0.08 + 0.12 * Math.sin(t * 2 + b.phase);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#8df";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* ======= エンティティ描画 ======= */

function _drawEntity(ctx, entity, t) {
  if (!entity.active) return;

  const cx       = entity.x + entity.size.width  / 2;
  const cy       = entity.y + entity.size.height / 2;
  const fontSize = Math.max(18, Math.min(entity.size.width, entity.size.height) * 0.7);

  ctx.save();

  // レアリティグロー
  const glow = RARITY_GLOW[entity.rarity];
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur  = entity.rarity === "superRare" ? 22 : 14;
  }

  // 絵文字
  ctx.font          = `${fontSize}px serif`;
  ctx.textAlign     = "center";
  ctx.textBaseline  = "middle";
  ctx.fillText(entity.emoji, cx, cy);
  ctx.shadowBlur = 0;

  // 名前タグ
  const tagFontSize = Math.max(9, fontSize * 0.35);
  ctx.font = `bold ${tagFontSize}px sans-serif`;
  ctx.textBaseline = "top";
  const tagY = entity.y + entity.size.height + 2;
  const tw   = ctx.measureText(entity.name).width + 6;

  ctx.globalAlpha = 0.65;
  ctx.fillStyle   = "#000";
  ctx.beginPath();
  const tx = cx - tw / 2, ty = tagY, tr = 3, th = tagFontSize + 4;
  if (ctx.roundRect) {
    ctx.roundRect(tx, ty, tw, th, tr);
  } else {
    ctx.rect(tx, ty, tw, th);
  }
  ctx.fill();

  ctx.globalAlpha = 1;
  const tagColors = { common: "#cef", uncommon: "#afa", rare: "#ff8", superRare: "#f8f" };
  ctx.fillStyle = tagColors[entity.rarity] ?? "#cef";
  ctx.fillText(entity.name, cx, tagY + 2);

  ctx.restore();
}

/* ======= パーティクル ======= */

function _drawParticles(ctx, particles) {
  ctx.save();
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ======= 網（右端固定・上下移動） ======= */

function _drawNet(ctx, pos, radius, t) {
  if (pos.y < 0) return;
  const { x, y } = pos;
  ctx.save();

  // 縦ガイドライン（右端の釣り糸ライン）
  ctx.strokeStyle = "rgba(200,240,255,0.18)";
  ctx.lineWidth   = 1;
  ctx.setLineDash([5, 7]);
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, CANVAS_H);
  ctx.stroke();
  ctx.setLineDash([]);

  // 上下の矢印ガイド
  const arrowAlpha = 0.3 + 0.2 * Math.sin(t * 2);
  ctx.globalAlpha = arrowAlpha;
  ctx.fillStyle   = "#8df";
  _drawArrow(ctx, x, y - radius - 14, "up");
  _drawArrow(ctx, x, y + radius + 14, "down");
  ctx.globalAlpha = 1;

  // 外縁リング（やや太め）
  ctx.strokeStyle = "rgba(200,240,255,0.9)";
  ctx.lineWidth   = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // 網目
  ctx.strokeStyle = "rgba(200,240,255,0.28)";
  ctx.lineWidth   = 1;
  const step = radius / 2.2;
  for (let dx = -radius; dx <= radius; dx += step) {
    const hy = Math.sqrt(Math.max(0, radius * radius - dx * dx));
    ctx.beginPath(); ctx.moveTo(x + dx, y - hy); ctx.lineTo(x + dx, y + hy); ctx.stroke();
  }
  for (let dy = -radius; dy <= radius; dy += step) {
    const hw = Math.sqrt(Math.max(0, radius * radius - dy * dy));
    ctx.beginPath(); ctx.moveTo(x - hw, y + dy); ctx.lineTo(x + hw, y + dy); ctx.stroke();
  }

  // 中心点（ぴくぴく）
  const pulse = 1 + 0.15 * Math.sin(t * 6);
  ctx.globalAlpha = 0.6;
  ctx.fillStyle   = "#cff";
  ctx.beginPath();
  ctx.arc(x, y, 3.5 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function _drawArrow(ctx, x, y, dir) {
  const s = 5;
  ctx.beginPath();
  if (dir === "up") {
    ctx.moveTo(x, y - s); ctx.lineTo(x - s, y + s); ctx.lineTo(x + s, y + s);
  } else {
    ctx.moveTo(x, y + s); ctx.lineTo(x - s, y - s); ctx.lineTo(x + s, y - s);
  }
  ctx.closePath();
  ctx.fill();
}

/* ======= HUD（DOM）更新 ======= */

export function updateHUD(state) {
  const level  = state.currentSeaLevel;
  const points = state.seaPoint;
  const cfg    = stageMaster.levels.find(l => l.level === level) ?? stageMaster.levels[0];
  const next   = stageMaster.levels.find(l => l.level === level + 1);

  const timerEl = document.getElementById("timer-display");
  const secs    = Math.ceil(state.timeLeft);
  if (timerEl) {
    timerEl.textContent = secs;
    timerEl.classList.toggle("urgent", secs <= 10);
  }

  const levelEl = document.getElementById("sea-level-badge");
  if (levelEl) levelEl.textContent = `🌊 Lv${level}：${cfg.name}`;

  const ptText = document.getElementById("sea-point-text");
  if (ptText) ptText.textContent = `${points} pt`;

  const ptBar = document.getElementById("sea-point-bar");
  if (ptBar && next) {
    const pct = Math.min(100,
      ((points - cfg.requiredPoint) / (next.requiredPoint - cfg.requiredPoint)) * 100,
    );
    ptBar.style.width = `${Math.max(0, pct)}%`;
  } else if (ptBar) {
    ptBar.style.width = "100%";
  }
}

/** キャッチフィードに1件追加する */
export function addCatchFeed(entity) {
  const feed = document.getElementById("catch-feed");
  if (!feed) return;
  const item = document.createElement("div");
  item.className = "catch-feed-item";
  item.textContent = `${entity.type === "fish" ? "🎣" : "🧹"} ${entity.name}`;
  feed.prepend(item);
  while (feed.children.length > 4) feed.removeChild(feed.lastChild);
  setTimeout(() => {
    item.style.transition = "opacity 0.5s";
    item.style.opacity    = "0";
    setTimeout(() => item.remove(), 500);
  }, 2000);
}
