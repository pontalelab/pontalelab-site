import type { ActiveBug, Rarity } from '../types'
import { bugMap } from '../data/bugs'

export type ScreenEffect = 'darken' | 'special'

export type CaptureResult = {
  instanceId: string
  bugId: string
  bugName: string
  rarity: Rarity
  screenEffect: ScreenEffect | null
}

const SCREEN_EFFECT: Partial<Record<Rarity, ScreenEffect>> = {
  epic: 'darken',
  legendary: 'special',
}

export function processCatch(bug: ActiveBug): CaptureResult | null {
  if (bug.state !== 'idle') return null
  const master = bugMap.get(bug.bugId)
  if (!master) return null
  return {
    instanceId: bug.instanceId,
    bugId: bug.bugId,
    bugName: master.name,
    rarity: master.rarity,
    screenEffect: SCREEN_EFFECT[master.rarity] ?? null,
  }
}
