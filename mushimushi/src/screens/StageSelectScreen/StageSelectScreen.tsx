import type { ScreenName } from '../../types/screen'
import { SCREENS } from '../../constants/screens'
import { useGameStore } from '../../stores/gameStore'
import { stageMasters } from '../../data/stages'
import styles from './StageSelectScreen.module.css'

interface Props {
  onNavigate: (screen: ScreenName) => void
}

export function StageSelectScreen({ onNavigate }: Props) {
  const setStage = useGameStore((s) => s.setStage)
  const unlockedStages = useGameStore((s) => s.unlockedStages)
  const currentStageId = useGameStore((s) => s.currentStageId)

  function handleSelect(stageId: string) {
    setStage(stageId)
    onNavigate(SCREENS.STAGE)
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => onNavigate(SCREENS.HOME)}
          aria-label="ホームへ戻る"
        >
          ← もどる
        </button>
        <h2 className={styles.heading}>フィールドを選ぶ</h2>
        <span />
      </header>

      <div className={styles.list}>
        {stageMasters.map((stage) => {
          const unlocked = unlockedStages.includes(stage.id)
          const active = stage.id === currentStageId
          return (
            <button
              key={stage.id}
              className={`${styles.stageBtn} ${active ? styles.active : ''} ${!unlocked ? styles.locked : ''}`}
              onClick={() => unlocked && handleSelect(stage.id)}
              disabled={!unlocked}
            >
              <div className={styles.stageInfo}>
                <span className={styles.stageTime}>{stage.timeLabel}</span>
                <span className={styles.stageName}>
                  {unlocked ? stage.name : '???'}
                </span>
                {unlocked && (
                  <span className={styles.ambientHint}>{stage.ambientText}</span>
                )}
              </div>
              {!unlocked && <span className={styles.lockIcon}>🔒</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
