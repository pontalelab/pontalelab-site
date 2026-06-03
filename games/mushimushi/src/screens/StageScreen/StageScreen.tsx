import { useState, useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
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

// ── Catch net effect ──
function CatchEffect({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  return (
    <div
      className={styles.catchNet}
      style={{ left: `${x}px`, top: `${y}px` }}
      onAnimationEnd={onDone}
    />
  )
}

// ── CaptureReveal: field → center → bottom bar ──
const ICONS_PER_ROW = 5
const BAR_PADDING_PX = 12
const BAR_ICON_GAP_PX = 5
const BAR_HEIGHT_VH = 0.25

interface RevealEntry {
  key: string
  bugId: string
  bugName: string
  rect: DOMRect
  targetIndex: number
}

function CaptureReveal({ bugId, bugName, rect, targetIndex, onComplete }: RevealEntry & { onComplete: () => void }) {
  const imgRef = useRef<HTMLImageElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const img = imgRef.current
    const txt = textRef.current
    const bg = backdropRef.current
    if (!img || !txt || !bg) return

    // Reveal size: 88% of screen width, max 340px
    const revealSize = Math.min(340, Math.floor(window.innerWidth * 0.88))
    // Bar / icon metrics (must match CSS)
    const barHeight = window.innerHeight * BAR_HEIGHT_VH
    const iconSize = Math.floor(
      (window.innerWidth - BAR_PADDING_PX * 2 - BAR_ICON_GAP_PX * (ICONS_PER_ROW - 1)) / ICONS_PER_ROW
    )
    const col = targetIndex % ICONS_PER_ROW
    const row = Math.floor(targetIndex / ICONS_PER_ROW)
    const rawTx = BAR_PADDING_PX + col * (iconSize + BAR_ICON_GAP_PX)
    const rawTy = window.innerHeight - barHeight + 6 + row * (iconSize + BAR_ICON_GAP_PX)
    const endScale = iconSize / revealSize
    const tx = rawTx + iconSize / 2 - revealSize / 2
    const ty = rawTy + iconSize / 2 - revealSize / 2

    // Center display position
    const sx = rect.left + rect.width / 2 - revealSize / 2
    const sy = rect.top + rect.height / 2 - revealSize / 2
    const cx = window.innerWidth / 2 - revealSize / 2
    const usableTop = 70
    const usableBottom = window.innerHeight - barHeight
    const blockHeight = revealSize + 4 + 36
    const cy = usableTop + Math.max(0, (usableBottom - usableTop - blockHeight) / 2)

    bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' })

    // Set img size dynamically
    img.style.width = `${revealSize}px`
    img.style.height = `${revealSize}px`

    const phase1 = img.animate([
      { transform: `translate(${sx}px, ${sy}px) scale(0.7)` },
      { transform: `translate(${cx}px, ${cy}px) scale(1)` },
    ], { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' })

    txt.animate([
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 300, delay: 450, easing: 'ease-out', fill: 'forwards' })

    phase1.onfinish = () => {
      const holdTimer = setTimeout(() => {
        bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' })
        txt.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
        const phase3 = img.animate([
          { transform: `translate(${cx}px, ${cy}px) scale(1)` },
          { transform: `translate(${tx}px, ${ty}px) scale(${endScale})` },
        ], { duration: 480, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' })
        phase3.onfinish = onComplete
      }, 2000)
      return () => clearTimeout(holdTimer)
    }

    return () => { phase1.cancel() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _revealSize = Math.min(340, Math.floor(window.innerWidth * 0.88))
  const _barHeight = window.innerHeight * BAR_HEIGHT_VH
  const _usableTop = 70
  const _blockHeight = _revealSize + 4 + 36
  const _cy = _usableTop + Math.max(0, (window.innerHeight - _barHeight - _usableTop - _blockHeight) / 2)
  const textTop = _cy + _revealSize + 4

  return (
    <>
      <div
        ref={backdropRef}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.52)',
          zIndex: 498, pointerEvents: 'none', opacity: 0,
        }}
      />
      <img
        ref={imgRef}
        src={`${import.meta.env.BASE_URL}bugs/${bugId}.png`}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '340px', height: '340px',
          objectFit: 'contain', pointerEvents: 'none',
          zIndex: 500, willChange: 'transform',
          filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.55))',
        }}
      />
      <div
        ref={textRef}
        style={{
          position: 'fixed', top: `${textTop}px`, left: 0, right: 0,
          textAlign: 'center', pointerEvents: 'none',
          zIndex: 500, opacity: 0,
          color: '#fff', fontSize: '1.6rem', fontWeight: '700',
          letterSpacing: '0.08em',
          textShadow: '0 2px 16px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,200,0.3)',
        }}
      >
        {bugName}はっけん！
      </div>
    </>
  )
}

// ── Stage transition overlay ──
function StageTransitionOverlay({
  nextStageId,
  onStageSwitch,
  onDone,
}: {
  nextStageId: string | null
  onStageSwitch: () => void
  onDone: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  const message = nextStageId
    ? 'もっと むしを\nさがしにいこう！'
    : 'たのしかったね！\nまたあそぼう！'

  useEffect(() => {
    const overlay = overlayRef.current
    const text = textRef.current
    if (!overlay || !text) return

    // Phase 1: fade to black (0.6s)
    const fadeIn = overlay.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 600, easing: 'ease-out', fill: 'forwards' }
    )

    fadeIn.onfinish = () => {
      // Text appears
      text.animate(
        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 350, easing: 'ease-out', fill: 'forwards' }
      )

      // After 1.5s: switch stage BGM (while still dark)
      const t1 = setTimeout(() => {
        onStageSwitch()

        // After 1s of new BGM playing: fade out overlay
        const t2 = setTimeout(() => {
          text.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' })
          const fadeOut = overlay.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 700, easing: 'ease-in', fill: 'forwards' }
          )
          fadeOut.onfinish = onDone
        }, 1000)
        return () => clearTimeout(t2)
      }, 1500)

      return () => clearTimeout(t1)
    }

    return () => { fadeIn.cancel() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed', inset: 0,
        background: '#080806',
        zIndex: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0,
      }}
    >
      <p
        ref={textRef}
        style={{
          color: '#e8e4de',
          fontSize: '1.5rem', fontWeight: '600',
          letterSpacing: '0.1em', textAlign: 'center', lineHeight: 1.9,
          opacity: 0, padding: '0 40px', whiteSpace: 'pre-line',
        }}
      >
        {message}
      </p>
    </div>
  )
}

// ──────────────────────────────────────────────

interface Props {
  onNavigate: (screen: ScreenName) => void
}

export function StageScreen({ onNavigate }: Props) {
  const currentStageId = useGameStore((s) => s.currentStageId)
  const captureBugInStore = useGameStore((s) => s.captureBug)
  const removeBugFromStore = useGameStore((s) => s.removeBug)
  const setStage = useGameStore((s) => s.setStage)
  const discoverBug = useEncyclopediaStore((s) => s.discoverBug)
  const incrementCapture = useEncyclopediaStore((s) => s.incrementCapture)
  const stage = stageMap.get(currentStageId)
  const activeBugs = useSpawnLoop()
  const [screenEffect, setScreenEffect] = useState<ScreenEffect | null>(null)
  const [runCaptures, setRunCaptures] = useState<string[]>([])
  const [revealQueue, setRevealQueue] = useState<RevealEntry[]>([])
  const [catchEffects, setCatchEffects] = useState<{ id: string; x: number; y: number }[]>([])
  const [transition, setTransition] = useState<{ nextStageId: string | null } | null>(null)
  const captureCountRef = useRef(0)
  const runCaptureCountRef = useRef(0)
  const pendingRevealCountRef = useRef(0)
  const stageDoneRef = useRef(false)
  const navInfoRef = useRef<{ nextStageId: string | null } | null>(null)

  useEffect(() => {
    audioSystem.setStage(currentStageId)
  }, [currentStageId])

  useEffect(() => {
    captureCountRef.current = 0
    pendingRevealCountRef.current = 0
    stageDoneRef.current = false
    navInfoRef.current = null
  }, [currentStageId])

  const handleRevealComplete = useCallback((key: string, bugId: string) => {
    setRevealQueue((prev) => prev.filter((r) => r.key !== key))
    setRunCaptures((prev) => [...prev, bugId])
    pendingRevealCountRef.current = Math.max(0, pendingRevealCountRef.current - 1)

    if (navInfoRef.current !== null && pendingRevealCountRef.current === 0) {
      const nav = navInfoRef.current
      navInfoRef.current = null
      setTransition({ nextStageId: nav.nextStageId })
    }
  }, [])

  const handleCapture = useCallback((instanceId: string, _bugId: string, rect: DOMRect) => {
    if (stageDoneRef.current) return
    const bug = useGameStore.getState().activeBugs.find((b) => b.instanceId === instanceId)
    if (!bug) return
    const result = processCatch(bug)
    if (!result) return

    captureBugInStore(instanceId)
    discoverBug(result.bugId)
    incrementCapture(result.bugId)
    saveGame()
    if (result.screenEffect) setScreenEffect(result.screenEffect)

    // Catch net effect at tap position
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setCatchEffects((prev) => [...prev, { id: instanceId, x: cx, y: cy }])

    // Queue reveal animation
    const targetIndex = runCaptureCountRef.current
    runCaptureCountRef.current += 1
    pendingRevealCountRef.current += 1
    setRevealQueue((prev) => [...prev, {
      key: instanceId,
      bugId: result.bugId,
      bugName: result.bugName,
      rect,
      targetIndex,
    }])

    captureCountRef.current += 1
    if (captureCountRef.current >= CAPTURES_PER_STAGE) {
      stageDoneRef.current = true
      const idx = (RUN_STAGES as readonly string[]).indexOf(currentStageId)
      const nextStageId = idx >= 0 && idx < RUN_STAGES.length - 1 ? RUN_STAGES[idx + 1] : null
      navInfoRef.current = { nextStageId }
    }
  }, [captureBugInStore, discoverBug, incrementCapture, currentStageId])

  const handleCaptureComplete = useCallback((instanceId: string) => {
    removeBugFromStore(instanceId)
  }, [removeBugFromStore])

  return (
    <div className={styles.screen}>
      <div
        className={styles.background}
        data-bg={stage?.background}
        style={stage ? { backgroundImage: `url('${import.meta.env.BASE_URL}bg/${stage.background}.png')` } : undefined}
      />

      {stage?.timeOfDay === 'night' && (
        <div className={styles.particleLayer} aria-hidden="true">
          <span className={styles.mote1} />
          <span className={styles.mote2} />
          <span className={styles.mote3} />
        </div>
      )}

      {screenEffect && (
        <div
          className={`${styles.screenEffect} ${SCREEN_EFFECT_CLASS[screenEffect]}`}
          onAnimationEnd={() => setScreenEffect(null)}
        />
      )}

      <div className={styles.hud}>
        <HudButton icon="←" label="もどる" onClick={() => onNavigate(SCREENS.HOME)} />
        <div className={styles.hudCenter} />
        <HudButton icon="≡" label="図鑑" onClick={() => onNavigate(SCREENS.ENCYCLOPEDIA_LIST)} />
      </div>

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

      {catchEffects.map((c) => (
        <CatchEffect
          key={c.id}
          x={c.x}
          y={c.y}
          onDone={() => setCatchEffects((prev) => prev.filter((e) => e.id !== c.id))}
        />
      ))}

      {revealQueue[0] && (
        <CaptureReveal
          key={revealQueue[0].key}
          bugId={revealQueue[0].bugId}
          bugName={revealQueue[0].bugName}
          rect={revealQueue[0].rect}
          targetIndex={revealQueue[0].targetIndex}
          onComplete={() => handleRevealComplete(revealQueue[0].key, revealQueue[0].bugId)}
        />
      )}

      <BottomInfoArea runCaptures={runCaptures} />

      {transition && (
        <StageTransitionOverlay
          nextStageId={transition.nextStageId}
          onStageSwitch={() => {
            if (transition.nextStageId) {
              setStage(transition.nextStageId)
              audioSystem.setStage(transition.nextStageId)
            }
          }}
          onDone={() => {
            setTransition(null)
            if (!transition.nextStageId) {
              audioSystem.suspend()
              useGameStore.getState().setLastRunCaptures(runCaptures)
              onNavigate(SCREENS.RUN_RESULT)
            }
          }}
        />
      )}
    </div>
  )
}
