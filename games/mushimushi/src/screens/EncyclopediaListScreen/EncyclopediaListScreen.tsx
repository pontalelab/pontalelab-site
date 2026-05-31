import type { ScreenName } from '../../types/screen'
import { SCREENS } from '../../constants/screens'
import { useEncyclopediaStore } from '../../stores/encyclopediaStore'
import { bugMasters } from '../../data/bugs'
import { RARITY_COLOR } from '../../data/rarity'
import styles from './EncyclopediaListScreen.module.css'

interface Props {
  onNavigate: (screen: ScreenName) => void
  onBugSelect: (bugId: string) => void
}

export function EncyclopediaListScreen({ onNavigate, onBugSelect }: Props) {
  const discoveredBugs = useEncyclopediaStore((s) => s.discoveredBugs)
  const capturedCounts = useEncyclopediaStore((s) => s.capturedCounts)
  const newBugs = useEncyclopediaStore((s) => s.newBugs)

  const discoveredCount = discoveredBugs.length
  const totalCount = bugMasters.length

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => onNavigate(SCREENS.HOME)}
          aria-label="ホームへ戻る"
        >
          ←
        </button>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>観察ノート</h1>
          <p className={styles.subtitle}>{discoveredCount} / {totalCount} 種みつけた</p>
        </div>
        <div className={styles.headerSpacer} />
      </div>

      <div className={styles.grid}>
        {bugMasters.map((bug, index) => {
          const isDiscovered = discoveredBugs.includes(bug.id)
          const isNew = newBugs.includes(bug.id)
          const count = capturedCounts[bug.id] ?? 0
          return (
            <button
              key={bug.id}
              className={`${styles.card} ${isDiscovered ? styles.cardDiscovered : styles.cardHidden}`}
              onClick={isDiscovered ? () => onBugSelect(bug.id) : undefined}
              disabled={!isDiscovered}
              style={isDiscovered
                ? ({ '--rarity-color': RARITY_COLOR[bug.rarity] } as React.CSSProperties)
                : undefined
              }
              aria-label={isDiscovered ? bug.name : '未発見'}
            >
              {isNew && <span className={styles.newBadge}>NEW</span>}
              <span className={styles.entryNo}>No.{String(index + 1).padStart(2, '0')}</span>
              <img
                className={`${styles.cardSprite} ${!isDiscovered ? styles.silhouette : ''}`}
                src={`${import.meta.env.BASE_URL}bugs/${bug.id}.png`}
                alt={isDiscovered ? bug.name : ''}
                draggable={false}
              />
              <span className={styles.cardName}>
                {isDiscovered ? bug.name : '？？？'}
              </span>
              {isDiscovered && (
                <span className={styles.cardCount}>×{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
