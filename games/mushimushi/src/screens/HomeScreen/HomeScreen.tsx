import type { ScreenName } from '../../types/screen'
import { SCREENS } from '../../constants/screens'
import { useGameStore } from '../../stores/gameStore'
import { RUN_STAGES } from '../../constants/run'
import styles from './HomeScreen.module.css'

interface Props {
  onNavigate: (screen: ScreenName) => void
}

export function HomeScreen({ onNavigate }: Props) {
  const setStage = useGameStore((s) => s.setStage)

  function startGame() {
    setStage(RUN_STAGES[0])
    onNavigate(SCREENS.STAGE)
  }

  return (
    <div
      className={styles.screen}
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}home_bg.png')` }}
    >
      <div className={styles.content}>
        <h1 className={styles.title}>むしたん</h1>
        <p className={styles.subtitle}>むしさがしの たんけんだ！</p>
      </div>
      <nav className={styles.nav}>
        <button className={styles.primaryBtn} onClick={startGame}>
          虫取り開始
        </button>
        <button
          className={styles.secondaryBtn}
          onClick={() => onNavigate(SCREENS.ENCYCLOPEDIA_LIST)}
        >
          図鑑を見る
        </button>
      </nav>
    </div>
  )
}
