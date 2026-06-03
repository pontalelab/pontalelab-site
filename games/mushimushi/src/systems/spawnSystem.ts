import type { SpawnEntry, ActiveBug, ZoneArea, BugZone } from '../types';
import { bugMap } from '../data/bugs';

function weightedRandom(table: SpawnEntry[]): string {
  const total = table.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of table) {
    r -= entry.weight;
    if (r <= 0) return entry.bugId;
  }
  return table[table.length - 1].bugId;
}

function pickPosition(areas: ZoneArea[]): { x: number; y: number } {
  const area = areas[Math.floor(Math.random() * areas.length)];
  return {
    x: area.xMin + Math.random() * (area.xMax - area.xMin),
    y: area.yMin + Math.random() * (area.yMax - area.yMin),
  };
}

export function createActiveBug(
  spawnTable: SpawnEntry[],
  zones: Record<BugZone, ZoneArea[]>,
): ActiveBug {
  const bugId = weightedRandom(spawnTable);
  const master = bugMap.get(bugId);
  const zone: BugZone = master?.zone ?? 'grass';
  const { x, y } = pickPosition(zones[zone]);
  return {
    instanceId: `${Date.now()}-${Math.random()}`,
    bugId,
    x,
    y,
    spawnedAt: Date.now(),
    state: 'idle',
  };
}

export const SPAWN_INTERVAL_MS = 9000;
export const DESPAWN_AFTER_MS = 12000;
export const MAX_ACTIVE_BUGS = 6;
