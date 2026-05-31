import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useEncyclopediaStore } from '../stores/encyclopediaStore';
import { useUiStore } from '../stores/uiStore';
import { bugMap } from '../data/bugs';
import { saveGame } from '../systems/saveSystem';
import { stageMap } from '../data/stages';

const UNLOCK_THRESHOLD: Record<string, { stageId: string; count: number }> = {
  grass_day: { stageId: 'forest_evening', count: 5 },
  forest_evening: { stageId: 'night_field', count: 5 },
};

export function useCaptureHandler() {
  const captureBug = useGameStore((s) => s.captureBug);
  const removeBug = useGameStore((s) => s.removeBug);
  const unlockStage = useGameStore((s) => s.unlockStage);
  const currentStageId = useGameStore((s) => s.currentStageId);
  const discoverBug = useEncyclopediaStore((s) => s.discoverBug);
  const incrementCapture = useEncyclopediaStore((s) => s.incrementCapture);
  const capturedCounts = useEncyclopediaStore((s) => s.capturedCounts);
  const showToast = useUiStore((s) => s.showToast);

  return useCallback(
    (instanceId: string, bugId: string) => {
      const bug = bugMap.get(bugId);
      if (!bug) return;

      captureBug(instanceId);
      const isNew = discoverBug(bugId);
      incrementCapture(bugId);

      setTimeout(() => removeBug(instanceId), 800);

      if (isNew) {
        showToast(`✨ NEW！ ${bug.name} を初発見！`, true);
      } else {
        showToast(`${bug.sprite} ${bug.name} を捕まえた！`);
      }

      // unlock next stage
      const unlock = UNLOCK_THRESHOLD[currentStageId];
      if (unlock) {
        const newCount = (capturedCounts[bugId] ?? 0) + 1;
        const totalCaptured = Object.values({
          ...capturedCounts,
          [bugId]: newCount,
        }).reduce((s, c) => s + c, 0);

        const unlockedStages = useGameStore.getState().unlockedStages;
        if (
          !unlockedStages.includes(unlock.stageId) &&
          totalCaptured >= unlock.count
        ) {
          unlockStage(unlock.stageId);
          const nextStage = stageMap.get(unlock.stageId);
          if (nextStage) {
            showToast(`🔓 新ステージ「${nextStage.name}」が解放！`);
          }
        }
      }

      saveGame();
    },
    [captureBug, removeBug, discoverBug, incrementCapture, capturedCounts, showToast, currentStageId, unlockStage],
  );
}
