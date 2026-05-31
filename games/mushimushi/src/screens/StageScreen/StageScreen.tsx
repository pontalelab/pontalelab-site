import { useState, useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useUiStore } from '../../stores/uiStore'
import { useEncyclopediaStore } from '../../stores/encyclopediaStore'
import { stageMap } from '../../data/stages'
import { useSpawnLoop } from '../../hooks/useSpawnLoop'
import { BugSprite } from '../../components/BugSprite/BugSprite'
import { processCatch, type ScreenEffect } from '../../systems/captureSystem'
import { saveGame } from '../../systems/saveSystem'
import { audioSystem } from '../../systems/audioSystem'
import type { ScreenName } from '../../types/screen'
import { SCREENS } from '../../constants/screens'
import { RUN_STAGES, CAPTURES_PER_STAGE } from '../../constants/run'
import { HudButton } from './components/HudButton/HudButton'
import { BottomInfoArea } from './components/BottomInfoArea/BottomInfoArea'
import styles from './StageScreen.module.css'

const SCREEN_EFFECT_CLASS: Record<ScreenEffect, string> = {
  darken: styles.darken,
  special: styles.special,
}

interface Props {
  onNavigate: (screen: ScreenName) => void
}

export function StageScreen({ onNavigate }: Props) {
  const currentStageId = useGameStore((s) => s.currentStageId)
  const captureBugInStore = useGameStore((s) => s.captureBug)
  const removeBugFromStore = useGameStore((s) => s.removeBug)
  const setStage = useGameStore((s) => s.setStage)
  const showToast = useUiStore((s) => s.showToast)
  const discoverBug = useEncyclopediaStore((s) => s.discoverBug)
  const incrementCapture = useEncyclopediaStore((s) => s.incrementCapture)
  const stage = stageMap.get(currentStageId)
  const activeBugs = useSpawnLoop()
  const [screenEffect, setScreenEffect] = useState<ScreenEffect | null>(null)
  const [stageCaptureCount, setStageCaptureCount] = useState(0)
  const captureCountRef = useRef(0)
  const stageDoneRef = useRef(false)

  useEffect(() => {
    audioSystem.setStage(currentStageId)
  }, [currentStageId])

  // Reset per-stage counters when stage changes
  useEffect(() => {
    captureCountRef.current = 0
    setStageCaptureCount(0)
    stageDoneRef.current = false
  }, [currentStageId])

  const handleCapture = useCallback((instanceId: string, _bugId: string) => {
    if (stageDoneRef.current) return
    const bug = useGameStore.getState().activeBugs.find((b) => b.instanceId === instanceId)
    if (!bug) return
    const result = processCatch(bug)
    if (!result) return

    captureBugInStore(instanceId)
    const isFirst = discoverBug(result.bugId)
    incrementCapture(result.bugId)
    saveGame()
    showToast(isFirst ? `${result.bugName} を発見！` : result.bugName, isFirst)
    if (result.screenEffect) setScreenEffect(result.screenEffect)

    captureCountRef.current += 1
    setStageCaptureCount(captureCountRef.current)

    if (captureCountRef.current >= CAPTURES_PER_STAGE) {
      stageDoneRef.current = true
      const idx = (RUN_STAGES as readonly string[]).indexOf(currentStageId)
      const nextStageId = idx >= 0 && idx < RUN_STAGES.length - 1 ? RUN_STAGES[idx + 1] : null
      // Show transition toast after bug-name toast fades
      setTimeout(() => showToast(nextStageId ? 'つぎのフィールドへ…' : 'おつかれさまでした', false), 600)
      setTimeout(() => {
        if (nextStageId) {
          setStage(nextStageId)
          onNavigate(SCREENS.STAGE)
        } else {
          onNavigate(SCREENS.HOME)
        }
      }, 1500)
    }
  }, [captureBugInStore, showToast, discoverBug, incrementCapture, currentStageId, setStage, onNavigate])

  const handleCaptureComplete = useCallback((instanceId: string) => {
    removeBugFromStore(instanceId)
  }, [removeBugFromStore])

  return (
    <div className={styles.screen}>
      {/* Background */}
      <div
        className={`${styles.background} ${
          stage ? (styles[stage.background as keyof typeof styles] ?? '') : ''
        }`}
      />

      {/* Ambient particles — night only */}
      {stage?.timeOfDay === 'night' && (
        <div className={styles.particleLayer} aria-hidden="true">
          <span className={styles.mote1} />
          <span className={styles.mote2} />
          <span className={styles.mote3} />
        </div>
      )}

      {/* Screen-level capture effect (epic / legendary) */}
      {screenEffect && (
        <div
          className={`${styles.screenEffect} ${SCREEN_EFFECT_CLASS[screenEffect]}`}
          onAnimationEnd={() => setScreenEffect(null)}
        />
      )}

      {/* HUD */}
      <div className={styles.hud}>
        <HudButton icon="←" label="もどる" onClick={() => onNavigate(SCREENS.HOME)} />
        <div className={styles.hudCenter} />
        <HudButton icon="≡" label="図鑑" onClick={() => onNavigate(SCREENS.ENCYCLOPEDIA_LIST)} />
      </div>

      {/* Spawn area */}
      <div className={styles.spawnArea}>
        {activeBugs.map((bug) => (
          <BugSprite
            key={bug.instanceId}
            bug={bug}
            onCapture={handleCapture}
            onCaptureComplete={handleCaptureComplete}
          />
        ))}
      </div>

      {/* Bottom Info */}
      {stage && (
        <BottomInfoArea
          stageName={stage.shortName}
          timeOfDay={stage.timeLabel}
          timeOfDayKey={stage.timeOfDay}
          ambientText={stage.ambientText}
          captureCount={stageCaptureCount}
          capturesPerStage={CAPTURES_PER_STAGE}
        />
      )}
    </div>
  )
}
