import { useEffect } from 'react'
import type { ScreenName } from '../../types/screen'
import { SCREENS } from '../../constants/screens'
import { bugMap } from '../../data/bugs'
import { stageMap } from '../../data/stages'
import { RARITY_COLOR, RARITY_LABEL } from '../../data/rarity'
import { useEncyclopediaStore } from '../../stores/encyclopediaStore'
import styles from './BugDetailScreen.module.css'

interface Props {
  bugId: string | null
  onNavigate: (screen: ScreenName) => void
}

export function BugDetailScreen({ bugId, onNavigate }: Props) {
  const discoveredBugs = useEncyclopediaStore((s) => s.discoveredBugs)
  const capturedCounts = useEncyclopediaStore((s) => s.capturedCounts)
  const viewBug = useEncyclopediaStore((s) => s.viewBug)

  const master = bugId ? bugMap.get(bugId) : null
  const isDiscovered = bugId ? discoveredBugs.includes(bugId) : false
  const captureCount = bugId ? (capturedCounts[bugId] ?? 0) : 0

  useEffect(() => {
    if (bugId) viewBug(bugId)
  }, [bugId, viewBug])

  if (!master) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => onNavigate(SCREENS.ENCYCLOPEDIA_LIST)}>
            ←
          </button>
          <span className={styles.headerLabel}>観察ノート</span>
          <div className={styles.headerSpacer} />
        </div>
      </div>
    )
  }

  const rarityColor = RARITY_COLOR[master.rarity]
  const rarityLabel = RARITY_LABEL[master.rarity]
  const habitats = master.stages
    .map((id) => stageMap.get(id)?.shortName)
    .filter((n): n is string => !!n)
    .join('・')

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => onNavigate(SCREENS.ENCYCLOPEDIA_LIST)}
          aria-label="観察ノートへ戻る"
        >
          ←
        </button>
        <span className={styles.headerLabel}>観察ノート</span>
        <div className={styles.headerSpacer} />
      </div>

      <div className={styles.body}>
        <div className={styles.spriteWrap}>
          <span className={`${styles.sprite} ${!isDiscovered ? styles.silhouette : ''}`}>
            {master.sprite}
          </span>
        </div>

        {isDiscovered ? (
          <>
            <h1 className={styles.bugName}>{master.name}</h1>
            <span
              className={styles.rarityBadge}
              style={{ color: rarityColor, borderColor: `${rarityColor}55` }}
            >
              {rarityLabel}
            </span>

            <dl className={styles.infoBlock}>
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>生息地</dt>
                <dd className={styles.infoValue}>{habitats || '—'}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>ようす</dt>
                <dd className={`${styles.infoValue} ${styles.description}`}>
                  {master.description}
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>みつけた回数</dt>
                <dd className={`${styles.infoValue} ${styles.countValue}`}>
                  {captureCount > 0 ? `${captureCount} 回` : '—'}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <div className={styles.unknownBody}>
            <p className={styles.unknownName}>？？？</p>
            <p className={styles.unknownHint}>まだ見ていない</p>
          </div>
        )}
      </div>
    </div>
  )
}
