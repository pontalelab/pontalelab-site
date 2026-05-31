import { useState, useEffect, memo } from 'react'
import type { ActiveBug, Rarity } from '../../types'
import { bugMap } from '../../data/bugs'
import { RARITY_COLOR } from '../../data/rarity'
import styles from './BugSprite.module.css'

const RARITY_OPACITY: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 0.85,
  rare: 0.65,
  epic: 0.45,
  legendary: 0.30,
}

const PARTICLE_OFFSETS = [
  { px: -30, py: -28 },
  { px: 28, py: -24 },
  { px: -22, py: 26 },
  { px: 26, py: 30 },
]

type Props = {
  bug: ActiveBug
  onCapture: (instanceId: string, bugId: string) => void
  onCaptureComplete: (instanceId: string) => void
}

export const BugSprite = memo(function BugSprite({ bug, onCapture, onCaptureComplete }: Props) {
  const [showParticles, setShowParticles] = useState(false)
  const master = bugMap.get(bug.bugId)
  const isCapturing = bug.state === 'captured'

  useEffect(() => {
    if (isCapturing && master?.rarity === 'rare') {
      setShowParticles(true)
    }
  }, [isCapturing, master?.rarity])

  if (!master) return null

  const rarityColor = RARITY_COLOR[master.rarity]
  const rarityOpacity = RARITY_OPACITY[master.rarity]

  function handleTap() {
    if (bug.state !== 'idle') return
    onCapture(bug.instanceId, bug.bugId)
  }

  return (
    <button
      className={`${styles.bug} ${isCapturing ? styles.capturing : ''}`}
      style={{
        left: `${bug.x}%`,
        top: `${bug.y}%`,
        opacity: rarityOpacity,
        '--rarity-color': rarityColor,
      } as React.CSSProperties}
      onClick={handleTap}
      onTouchStart={(e) => {
        e.preventDefault()
        handleTap()
      }}
      onAnimationEnd={isCapturing ? (e) => {
        if (e.target === e.currentTarget) onCaptureComplete(bug.instanceId)
      } : undefined}
      aria-label={master.name}
    >
      <span className={styles.sprite}>{master.sprite}</span>
      {showParticles && PARTICLE_OFFSETS.map((offset, i) => (
        <span
          key={i}
          className={styles.particle}
          style={{
            '--px': `${offset.px}px`,
            '--py': `${offset.py}px`,
            animationDelay: `${i * 30}ms`,
          } as React.CSSProperties}
          onAnimationEnd={i === PARTICLE_OFFSETS.length - 1 ? () => setShowParticles(false) : undefined}
        >
          🍃
        </span>
      ))}
    </button>
  )
})
