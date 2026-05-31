import type { SpawnEntry, ActiveBug } from '../types';

function weightedRandom(table: SpawnEntry[]): string {
  const total = table.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of table) {
    r -= entry.weight;
    if (r <= 0) return entry.bugId;
  }
  return table[table.length - 1].bugId;
}

export function createActiveBug(spawnTable: SpawnEntry[]): ActiveBug {
  const bugId = weightedRandom(spawnTable);
  const margin = 10;
  return {
    instanceId: `${Date.now()}-${Math.random()}`,
    bugId,
    x: margin + Math.random() * (100 - margin * 2),
    y: margin + Math.random() * (55 - margin * 2),
    spawnedAt: Date.now(),
    state: 'idle',
  };
}

export const SPAWN_INTERVAL_MS = 3000;
export const DESPAWN_AFTER_MS = 12000;
export const MAX_ACTIVE_BUGS = 6;
