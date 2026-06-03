import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { stageMap } from '../data/stages';
import {
  createActiveBug,
  SPAWN_INTERVAL_MS,
  DESPAWN_AFTER_MS,
  MAX_ACTIVE_BUGS,
} from '../systems/spawnSystem';

export function useSpawnLoop() {
  const currentStageId = useGameStore((s) => s.currentStageId);
  const addActiveBug = useGameStore((s) => s.addActiveBug);
  const removeBug = useGameStore((s) => s.removeBug);
  const despawnBug = useGameStore((s) => s.despawnBug);
  const activeBugs = useGameStore((s) => s.activeBugs);

  useEffect(() => {
    const stage = stageMap.get(currentStageId);
    if (!stage) return;

    const spawnTimer = setInterval(() => {
      const current = useGameStore.getState().activeBugs;
      const idleBugs = current.filter((b) => b.state === 'idle');
      if (idleBugs.length >= MAX_ACTIVE_BUGS) return;
      addActiveBug(createActiveBug(stage.spawnTable, stage.zones));
    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(spawnTimer);
  }, [currentStageId, addActiveBug]);

  useEffect(() => {
    const despawnTimer = setInterval(() => {
      const now = Date.now();
      const current = useGameStore.getState().activeBugs;
      for (const bug of current) {
        if (bug.state === 'idle' && now - bug.spawnedAt > DESPAWN_AFTER_MS) {
          despawnBug(bug.instanceId);
        }
      }
    }, 1000);

    return () => clearInterval(despawnTimer);
  }, [removeBug]);

  // initial spawn
  useEffect(() => {
    const stage = stageMap.get(currentStageId);
    if (!stage) return;
    // no initial spawn — first bug appears after SPAWN_INTERVAL_MS
  }, [currentStageId, addActiveBug]);

  return activeBugs;
}
