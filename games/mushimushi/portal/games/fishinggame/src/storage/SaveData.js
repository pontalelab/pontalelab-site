/** localStorage 保存データ管理 */

const SAVE_KEY = "sakana_save_v1";

export function getDefaultSaveData() {
  return {
    currentStageId: "sea",
    currentSeaLevel: 1,
    seaPoint: 0,
    collectedFishIds: [],
    fishCatchCounts: {},
    viewedMessages: [],
    settings: { bgmVolume: 0.5, sfxVolume: 0.8 },
    tutorialDone: false,
  };
}

export function loadSaveData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return getDefaultSaveData();
    return { ...getDefaultSaveData(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSaveData();
  }
}

export function saveSaveData(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("保存に失敗しました:", e);
  }
}

/** ゲーム終了後にセッション結果をマージして保存する */
export function applySessionResult(saveData, sessionResult) {
  const updated = { ...saveData };

  updated.seaPoint += sessionResult.pointGained;

  for (const fishId of sessionResult.caughtFishIds) {
    if (!updated.collectedFishIds.includes(fishId)) {
      updated.collectedFishIds.push(fishId);
    }
  }

  for (const [fishId, count] of Object.entries(sessionResult.catchCounts)) {
    updated.fishCatchCounts[fishId] = (updated.fishCatchCounts[fishId] || 0) + count;
  }

  for (const msgKey of sessionResult.viewedMessages) {
    if (!updated.viewedMessages.includes(msgKey)) {
      updated.viewedMessages.push(msgKey);
    }
  }

  return updated;
}
