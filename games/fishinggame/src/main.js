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
import { createCleanupState } from "./cleanup/CleanupState.js";
import { CleanupLoop }        from "./cleanup/CleanupLoop.js";
import { CleanupScreen, updateCleanupHUD } from "./cleanup/CleanupScreen.js";

/* ===== 状態 ===== */
let saveData   = loadSaveData();
let gameLoop   = null;
let gameState  = null;
let gameScreen = null;
const audio    = new AudioManager();

/* ===== うみそうじモード用の状態（永続保存はしない） ===== */
let cleanupLoop   = null;
let cleanupState  = null;
let cleanupScreen = null;

/* ===== ホーム画面 ===== */
function goHome() {
  if (gameLoop)    { gameLoop.stop();    gameLoop = null; }
  if (cleanupLoop) { cleanupLoop.stop(); cleanupLoop = null; }
  saveData = loadSaveData();
  showScreen("screen-home");
  renderHomeScreen(
    document.getElementById("screen-home"),
    saveData,
    () => startGame(),
    () => goBook(),
    () => resetSea(),
    () => startCleanup(),
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
    "うみをリセットしますか？\nうみレベルとぽいんとが さいしょに もどります。\nずかんは のこります。",
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

/* ===== うみをそうじする（新モード） ===== */
function startCleanup() {
  hideCleanupClearToast();
  document.getElementById("overlay-cleanup-timeup")?.classList.add("hidden");
  cleanupState = createCleanupState();

  const canvas = document.getElementById("cleanup-canvas");
  cleanupScreen = new CleanupScreen(canvas);
  cleanupScreen.resize();

  showScreen("screen-cleanup");

  cleanupLoop = new CleanupLoop(
    cleanupState,
    { render: (state) => { cleanupScreen.render(state); updateCleanupHUD(state); } },
    audio,
    {
      onTrashRemoved:  () => updateCleanupHUD(cleanupState),
      onStageChange:   () => updateCleanupHUD(cleanupState),
      onClearMoment:   () => showCleanupClearToast(),
      onClearToastEnd: () => hideCleanupClearToast(),
      onFishCatch:     () => updateCleanupHUD(cleanupState),
      onTimeUp:        (state) => showCleanupTimeUpOverlay(state),
    },
  );

  cleanupLoop.start();
  updateCleanupHUD(cleanupState);
  _bindCleanupInputEvents(canvas);

  // QA/自動テスト用のデバッグフック（ゲームプレイには影響しない）
  window.__cleanupDebug = { state: cleanupState, loop: cleanupLoop };
}

let _cleanupInputBound = false;

// #cleanup-canvas はモード再入場（リプレイ／ホーム経由の再開始）のたびに
// startCleanup() から呼ばれるが、DOM要素自体は使い回されるため、毎回bindすると
// クリックリスナーが多重登録され、1回のタップでhandleTapが複数回走ってしまう。
// そのため、bindは初回の1回だけに限定する（cleanupLoop/cleanupScreenは
// モジュール変数として都度最新の値を参照するので、これで問題ない）。
function _bindCleanupInputEvents(canvas) {
  if (_cleanupInputBound) return;
  _cleanupInputBound = true;

  canvas.addEventListener("click", (e) => {
    if (!cleanupLoop) return;
    const pos = cleanupScreen.toCanvasCoords(e.clientX, e.clientY);
    cleanupLoop.handleTap(pos.x, pos.y);
  });

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!cleanupLoop) return;
    const pos = cleanupScreen.toCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    cleanupLoop.handleTap(pos.x, pos.y);
  }, { passive: false });
}

/**
 * 「うみが きれいに なったよ」の一時的なお祝いトースト。
 * モーダルではないためゲームは止まらず、そのまま遊び続けられる
 * （そして、しばらく経つとまたゴミが流れてきて海は汚れうる）。
 */
function showCleanupClearToast() {
  const toast = document.getElementById("cleanup-clear-toast");
  if (toast) toast.classList.add("show");
}

function hideCleanupClearToast() {
  const toast = document.getElementById("cleanup-clear-toast");
  if (toast) toast.classList.remove("show");
}

/** 90秒のプレイ時間が終わったときの、リプレイ導線つきオーバーレイ */
function showCleanupTimeUpOverlay(state) {
  const overlay  = document.getElementById("overlay-cleanup-timeup");
  const summary  = document.getElementById("cleanup-timeup-summary");
  const replayBtn = document.getElementById("cleanup-timeup-replay");
  const homeBtn   = document.getElementById("cleanup-timeup-home");

  const best = state?.bestComboStep ?? 0;
  summary.textContent = best > 0
    ? `いまの うみ：${state.stage.name}／さいこうコンボ：${best}`
    : `いまの うみ：${state.stage.name}`;
  overlay.classList.remove("hidden");

  const onReplay = () => {
    overlay.classList.add("hidden");
    replayBtn.removeEventListener("click", onReplay);
    homeBtn.removeEventListener("click", onHome);
    if (cleanupLoop) { cleanupLoop.stop(); cleanupLoop = null; }
    startCleanup();
  };
  const onHome = () => {
    overlay.classList.add("hidden");
    replayBtn.removeEventListener("click", onReplay);
    homeBtn.removeEventListener("click", onHome);
    goHome();
  };

  replayBtn.addEventListener("click", onReplay);
  homeBtn.addEventListener("click", onHome);
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

/* ===== うみそうじ画面：もどるボタン ===== */
document.getElementById("cleanup-back").addEventListener("click", () => goHome());

/* ===== リサイズ対応 ===== */
window.addEventListener("resize", () => {
  if (gameScreen) gameScreen.resize();
  if (cleanupScreen) cleanupScreen.resize();
});

/* ===== 起動 ===== */
goHome();
