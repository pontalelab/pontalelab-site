import { useMemo, useRef, useEffect } from 'react'
import type { ScreenName } from '../../types/screen'
import { SCREENS } from '../../constants/screens'
import { useGameStore } from '../../stores/gameStore'
import { bugMap } from '../../data/bugs'
import { RARITY_COLOR } from '../../data/rarity'
import type { Rarity } from '../../types'
import styles from './RunResultScreen.module.css'

const RARITY_ORDER: Record<Rarity, number> = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4,
}

const EVALUATIONS = [
  'むしとりめいじんだね！\nすごいうでまえだよ！',
  'たくさんのむしをみつけたね！\nまたあそぼうね！',
  'むしはかせになれるよ！\nよくがんばったね！',
]

interface Props {
  onNavigate: (screen: ScreenName) => void
}

export function RunResultScreen({ onNavigate }: Props) {
  const lastRunCaptures = useGameStore((s) => s.lastRunCaptures)
  const base = import.meta.env.BASE_URL
  const evaluationRef = useRef(EVALUATIONS[Math.floor(Math.random() * EVALUATIONS.length)])

  // Unique bugs sorted by rarity (low → high)
  const sortedBugs = useMemo(() => {
    const unique = [...new Set(lastRunCaptures)]
    return unique
      .map((id) => bugMap.get(id))
      .filter(Boolean)
      .sort((a, b) => RARITY_ORDER[a!.rarity] - RARITY_ORDER[b!.rarity]) as NonNullable<ReturnType<typeof bugMap.get>>[]
  }, [lastRunCaptures])

  // Rarest bug = last in sorted array
  const rarestBug = sortedBugs[sortedBugs.length - 1]

  // Count per bug
  const countMap = useMemo(() => {
    const m: Record<string, number> = {}
    for (const id of lastRunCaptures) m[id] = (m[id] ?? 0) + 1
    return m
  }, [lastRunCaptures])

  // Screen appears with fade-in
  const screenRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    screenRef.current?.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 600, easing: 'ease-out', fill: 'forwards' }
    )
  }, [])

  return (
    <div ref={screenRef} className={styles.screen} style={{ opacity: 0 }}>
      <h1 className={styles.title}>むしとりのきろく</h1>

      <div className={styles.grid}>
        {sortedBugs.map((bug, i) => {
          const isRarest = bug.id === rarestBug?.id
          const color = RARITY_COLOR[bug.rarity]
          const count = countMap[bug.id] ?? 1
          const delay = `${i * 200}ms`
          return (
            <div
              key={bug.id}
              className={`${styles.card} ${isRarest ? styles.rarestCard : ''}`}
              style={{
                '--rarity-color': color,
                animationDelay: delay,
              } as React.CSSProperties}
            >
              <img
                className={styles.bugImg}
                src={`${base}bugs/${bug.id}.png`}
                alt={bug.name}
                draggable={false}
              />
              <p className={styles.bugName}>{bug.name}</p>
              {count > 1 && <span className={styles.count}>×{count}</span>}
              {isRarest && <span className={styles.rarestBadge}>★</span>}
            </div>
          )
        })}
      </div>

      <p className={styles.evaluation}>{evaluationRef.current}</p>

      <button className={styles.homeBtn} onClick={() => onNavigate(SCREENS.HOME)}>
        ホームへ
      </button>
    </div>
  )
}
