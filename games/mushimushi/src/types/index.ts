export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type TimeOfDay = 'day' | 'evening' | 'night'

export type GamePhase =
  | 'idle'
  | 'stage-loading'
  | 'exploring'
  | 'capture-result'
  | 'stage-clear'
  | 'next-stage'
  | 'run-finished'

export type BugMaster = {
  id: string
  name: string
  rarity: Rarity
  sprite: string
  description: string
  stages: string[]
}

export type SpawnEntry = {
  bugId: string
  weight: number
}

export type StageMaster = {
  id: string
  name: string
  shortName: string
  timeLabel: string
  timeOfDay: TimeOfDay
  background: string
  ambientColor: string
  ambientText: string
  spawnTable: SpawnEntry[]
}

export type SaveData = {
  version: number
  discoveredBugs: string[]
  capturedCounts: Record<string, number>
  unlockedStages: string[]
  settings: SettingsData
}

export type SettingsData = {
  soundEnabled: boolean
  volume: number
}

export type ActiveBug = {
  instanceId: string
  bugId: string
  x: number
  y: number
  spawnedAt: number
  state: 'idle' | 'captured' | 'despawning'
}
