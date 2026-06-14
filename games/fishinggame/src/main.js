/** アプリエントリポイント：全モジュールを配線する */

import { loadSaveData, saveSaveData, applySessionResult, getDefaultSaveData } from "./storage/SaveData.js";
import { stageMaster }       from "./data/stageMaster.js";
import { createGameState }   from "./game/GameState.js";
import { GameLoop }          from "./game/GameLoop.js";
import { AudioManager }      from "./audio/AudioManager.js";
import { GameScreen, updateHUD, addCatchFeed } from "./ui/GameScreen.js";
import { showScreen }        from "./ui/ScreenManager.js";
import { renderHomeScreen }  from "./ui/HomeScreen.js";
import { renderResultScreen } from "./ui/ResultScreen.js";
import { renderBookScreen }  from "./ui/BookScreen.js";

/* ===== 状態 ===== */
let saveData   = loadSaveData();
let gameLoop   = null;
let gameState  = null;
let gameScreen = null;
const audio    = new AudioManager();

/* ===== ホーム画面 ===== */
function goHome() {
  if (gameLoop) { gameLoop.stop(); gameLoop = null; }
  saveData = loadSaveData();
  showScreen("screen-home");
  renderHomeScreen(
    document.getElementById("screen-home"),
    saveData,
    () => startGame(),
    () => goBook(),
    () => resetSea(),
  );
}

function goBook() {
  showScreen("screen-book");
  renderBookScreen(
    document.getElementById("screen-book"),
    saveData,
    () => goHome(),
  );
}

/* ===== 海リセット ===== */
function resetSea() {
  // シンプルな確認（子供向けなのでシンプルに）
  const confirmed = confirm(
    "海をリセットしますか？\n海レベルとポイントが最初に戻ります。\n図鑑は残ります。",
  );
  if (!confirmed) return;

  const fresh = getDefaultSaveData();
  // 図鑑と捕獲回数はリセットしない
  fresh.collectedFishIds = saveData.collectedFishIds;
  fresh.fishCatchCounts  = saveData.fishCatchCounts;
  fresh.settings         = saveData.settings;
  fresh.tutorialDone     = saveData.tutorialDone;

  saveData = fresh;
  saveSaveData(saveData);
  goHome();
}

/* ===== ゲーム開始 ===== */
function startGame() {
  const level       = saveData.currentSeaLevel;
  const levelConfig = stageMaster.levels.find(l => l.level === level) ?? stageMaster.levels[0];
  gameState = createGameState(saveData, levelConfig);

  const canvas = document.getElementById("game-canvas");
  gameScreen   = new GameScreen(canvas);
  gameScreen.resize();

  showScreen("screen-game");

  gameLoop = new GameLoop(
    gameState,
    { render: (state) => { gameScreen.render(state); updateHUD(state); } },
    audio,
    {
      onGameEnd: (state) => endGame(state),
      onMessage: (msg)   => showMessageOverlay(msg),
      onLevelUp: (cfg)   => showLevelUpOverlay(cfg),
      onCatch:   (entity) => addCatchFeed(entity),
    },
  );

  gameLoop.start();
  _bindInputEvents(canvas);
}

function _bindInputEvents(canvas) {
  // マウス：Y 座標だけ使う（X は GameLoop 内で右端固定）
  canvas.addEventListener("mousemove", (e) => {
    if (!gameLoop) return;
    const pos = gameScreen.toCanvasCoords(e.clientX, e.clientY);
    gameLoop.handleMouseMove(pos.x, pos.y);
  }, { passive: true });

  // クリックは不要（自動取得のため削除）

  // タッチ：上下スワイプで網を操作
  const toCanvas = (touch) => gameScreen.toCanvasCoords(touch.clientX, touch.clientY);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!gameLoop) return;
    const pos = toCanvas(e.touches[0]);
    gameLoop.handleMouseMove(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!gameLoop) return;
    const pos = toCanvas(e.touches[0]);
    gameLoop.handleMouseMove(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (!gameLoop) return;
    const pos = toCanvas(e.changedTouches[0]);
    gameLoop.handleMouseMove(pos.x, pos.y);
  }, { passive: false });
}

/* ===== ゲーム終了 ===== */
function endGame(state) {
  if (gameLoop) { gameLoop.stop(); gameLoop = null; }

  const sessionResult = {
    pointGained:    state.sessionPointGained,
    caughtFishIds:  state.sessionCaughtFishIds,
    catchCounts:    state.sessionCatchCounts,
    viewedMessages: state.sessionViewedMessages,
  };
  let updated = applySessionResult(saveData, sessionResult);
  updated.currentSeaLevel = state.currentSeaLevel;
  saveData = updated;
  saveSaveData(saveData);

  showScreen("screen-result");
  renderResultScreen(
    document.getElementById("screen-result"),
    state,
    saveData,
    () => goHome(),
  );
}

/* ===== オーバーレイ：メッセージボトル ===== */
function showMessageOverlay(message) {
  const overlay = document.getElementById("overlay-message");
  const textEl  = document.getElementById("overlay-message-text");
  const okBtn   = document.getElementById("overlay-message-ok");

  textEl.textContent = message;
  overlay.classList.remove("hidden");

  const onOk = () => {
    overlay.classList.add("hidden");
    okBtn.removeEventListener("click", onOk);
    if (gameLoop) gameLoop.resumeFromPause();
  };
  okBtn.addEventListener("click", onOk);
}

/* ===== オーバーレイ：レベルアップ ===== */
function showLevelUpOverlay(levelConfig) {
  const overlay = document.getElementById("overlay-levelup");
  const nameEl  = document.getElementById("levelup-name");
  const iconEl  = document.getElementById("levelup-icon");
  const okBtn   = document.getElementById("levelup-ok");

  nameEl.textContent = `Lv${levelConfig.level}：${levelConfig.name}`;
  iconEl.textContent = levelConfig.emoji ?? "🌊";
  overlay.classList.remove("hidden");

  const onOk = () => {
    overlay.classList.add("hidden");
    okBtn.removeEventListener("click", onOk);
    if (gameLoop) gameLoop.resumeFromPause();
  };
  okBtn.addEventListener("click", onOk);
}

/* ===== リサイズ対応 ===== */
window.addEventListener("resize", () => {
  if (gameScreen) gameScreen.resize();
});

/* ===== 起動 ===== */
goHome();
