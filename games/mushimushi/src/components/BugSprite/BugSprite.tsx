import { useState, useEffect, useRef, memo } from 'react'
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

type Props = {
  bug: ActiveBug
  onCapture: (instanceId: string, bugId: string, rect: DOMRect) => void
  onCaptureComplete: (instanceId: string) => void
}

export const BugSprite = memo(function BugSprite({ bug, onCapture, onCaptureComplete }: Props) {
  const [showParticles, setShowParticles] = useState(false)
  const [facingRight, setFacingRight] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const spawnEndedRef = useRef(false)
  const wanderRef = useRef<{ dx: string; dy: string; dur: string; goRight: boolean } | null>(null)

  const master = bugMap.get(bug.bugId)
  const isCapturing = bug.state === 'captured'
  const isDespawning = bug.state === 'despawning'
  const isWander = master?.movement === 'wander' && bug.state === 'idle'

  // Wander direction — computed once per instance
  if (master?.movement === 'wander' && !wanderRef.current) {
    const goRight = bug.x < 50
    const distPct = goRight ? (110 - bug.x) : (bug.x + 10)
    const distPx = distPct * window.innerWidth / 100
    const speed = 80 + Math.random() * 50
    const dur = distPx / speed
    wanderRef.current = {
      dx: `${goRight ? distPx : -distPx}px`,
      dy: `${(Math.random() * 2 - 1) * 50}px`,
      dur: `${dur.toFixed(1)}s`,
      goRight,
    }
  }

  // Sway: flip every half-cycle (2.5s)
  useEffect(() => {
    if (master?.movement !== 'sway') return
    const interval = setInterval(() => setFacingRight((f) => !f), 2500)
    return () => clearInterval(interval)
  }, [master?.movement])

  useEffect(() => {
    if (isCapturing && master?.rarity === 'rare') setShowParticles(true)
  }, [isCapturing, master?.rarity])

  if (!master) return null

  const rarityColor = RARITY_COLOR[master.rarity]
  const rarityOpacity = RARITY_OPACITY[master.rarity]

  const movementClass =
    master.movement === 'sway' ? styles.sway :
    master.movement === 'wander' ? styles.wander : ''

  // Determine horizontal flip
  const flipHorizontal =
    (master.movement === 'sway' && facingRight) ||
    (master.movement === 'wander' && (wanderRef.current?.goRight ?? false))

  const flipStyle: React.CSSProperties = flipHorizontal ? { transform: 'scaleX(-1)' } : {}

  const inlineStyle = {
    left: `${bug.x}%`,
    top: `${bug.y}%`,
    opacity: rarityOpacity,
    '--rarity-color': rarityColor,
    ...(wanderRef.current ? {
      '--wander-dx': wanderRef.current.dx,
      '--wander-dy': wanderRef.current.dy,
      '--wander-dur': wanderRef.current.dur,
    } : {}),
  } as React.CSSProperties

  function handleTap() {
    if (bug.state !== 'idle') return
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    onCapture(bug.instanceId, bug.bugId, rect)
  }

  function handleAnimationEnd(e: React.AnimationEvent) {
    if (e.target !== e.currentTarget) return
    if (isCapturing || isDespawning) {
      onCaptureComplete(bug.instanceId)
    } else if (isWander) {
      if (!spawnEndedRef.current) {
        spawnEndedRef.current = true   // first = bug-spawn
      } else {
        onCaptureComplete(bug.instanceId)  // second = bug-wander exit
      }
    }
  }

  return (
    <button
      ref={buttonRef}
      className={`${styles.bug} ${movementClass} ${isCapturing ? styles.capturing : ''} ${isDespawning ? styles.despawning : ''}`}
      style={inlineStyle}
      onClick={handleTap}
      onTouchStart={(e) => { e.preventDefault(); handleTap() }}
      onAnimationEnd={handleAnimationEnd}
      aria-label={master.name}
    >
      {/* Wrapper div handles horizontal flip without conflicting with animation */}
      <div style={flipStyle}>
        <img
          className={styles.sprite}
          src={`${import.meta.env.BASE_URL}bugs/${master.id}.png`}
          alt={master.name}
          draggable={false}
        />
      </div>
      {showParticles && [
        { px: -30, py: -28 }, { px: 28, py: -24 },
        { px: -22, py: 26 },  { px: 26, py: 30 },
      ].map((offset, i) => (
        <span
          key={i}
          className={styles.particle}
          style={{ '--px': `${offset.px}px`, '--py': `${offset.py}px`, animationDelay: `${i * 30}ms` } as React.CSSProperties}
          onAnimationEnd={i === 3 ? () => setShowParticles(false) : undefined}
        >🍃</span>
      ))}
    </button>
  )
})
