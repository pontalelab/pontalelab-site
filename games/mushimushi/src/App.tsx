import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import type { ScreenName } from './types/screen'
import { SCREENS } from './constants/screens'
import { SettingsOverlay } from './components/overlays/SettingsOverlay/SettingsOverlay'
import { ResultOverlay } from './components/overlays/ResultOverlay/ResultOverlay'
import { ToastContainer } from './components/Toast/Toast'
import { useUiStore } from './stores/uiStore'
import { loadGame } from './systems/saveSystem'
import { audioSystem } from './systems/audioSystem'
import styles from './App.module.css'

// Lazy-loaded screens — each becomes a separate JS chunk
const HomeScreen = lazy(() =>
  import('./screens/HomeScreen/HomeScreen').then((m) => ({ default: m.HomeScreen }))
)
const StageSelectScreen = lazy(() =>
  import('./screens/StageSelectScreen/StageSelectScreen').then((m) => ({ default: m.StageSelectScreen }))
)
const StageScreen = lazy(() =>
  import('./screens/StageScreen/StageScreen').then((m) => ({ default: m.StageScreen }))
)
const EncyclopediaListScreen = lazy(() =>
  import('./screens/EncyclopediaListScreen/EncyclopediaListScreen').then((m) => ({ default: m.EncyclopediaListScreen }))
)
const BugDetailScreen = lazy(() =>
  import('./screens/BugDetailScreen/BugDetailScreen').then((m) => ({ default: m.BugDetailScreen }))
)
const RunResultScreen = lazy(() =>
  import('./screens/RunResultScreen/RunResultScreen').then((m) => ({ default: m.RunResultScreen }))
)

type FadePhase = 'idle' | 'out' | 'in'
type PendingNav = { screen: ScreenName; bugId?: string }

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(SCREENS.HOME)
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null)
  const [fadePhase, setFadePhase] = useState<FadePhase>('idle')
  const [pending, setPending] = useState<PendingNav | null>(null)
  const { isSettingsOpen, isResultOpen, closeSettings, closeResult } = useUiStore()

  // Load save + set up audio unlock on first user interaction
  useEffect(() => {
    loadGame()

    const unlock = () => audioSystem.init()
    document.addEventListener('touchstart', unlock, { once: true, passive: true })
    document.addEventListener('click', unlock, { once: true })

    const handleVisibility = () => {
      if (document.hidden) audioSystem.suspend()
      else audioSystem.resume()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('click', unlock)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Execute pending navigation when fade-out completes (screen is black)
  useEffect(() => {
    if (fadePhase !== 'out' || !pending) return
    const t = setTimeout(() => {
      if (pending.bugId !== undefined) setSelectedBugId(pending.bugId)
      setCurrentScreen(pending.screen)
      setPending(null)
      setFadePhase('in')
    }, 230)
    return () => clearTimeout(t)
  }, [fadePhase, pending])

  const navigate = useCallback((screen: ScreenName) => {
    if (fadePhase !== 'idle') return
    setPending({ screen })
    setFadePhase('out')
  }, [fadePhase])

  const navigateToBugDetail = useCallback((bugId: string) => {
    if (fadePhase !== 'idle') return
    setPending({ screen: SCREENS.BUG_DETAIL, bugId })
    setFadePhase('out')
  }, [fadePhase])

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.HOME:
        return <HomeScreen onNavigate={navigate} />
      case SCREENS.STAGE_SELECT:
        return <StageSelectScreen onNavigate={navigate} />
      case SCREENS.STAGE:
        return <StageScreen onNavigate={navigate} />
      case SCREENS.ENCYCLOPEDIA_LIST:
        return <EncyclopediaListScreen onNavigate={navigate} onBugSelect={navigateToBugDetail} />
      case SCREENS.BUG_DETAIL:
        return <BugDetailScreen bugId={selectedBugId} onNavigate={navigate} />
      case SCREENS.RUN_RESULT:
        return <RunResultScreen onNavigate={navigate} />
      default:
        return <HomeScreen onNavigate={navigate} />
    }
  }

  return (
    <>
      <Suspense fallback={<div className={styles.loading} />}>
        {renderScreen()}
      </Suspense>

      {isSettingsOpen && <SettingsOverlay onClose={closeSettings} />}
      {isResultOpen && <ResultOverlay onClose={closeResult} />}
      <ToastContainer />

      {/* Screen transition overlay */}
      {fadePhase !== 'idle' && (
        <div
          className={`${styles.fade} ${fadePhase === 'out' ? styles.fadeOut : styles.fadeIn}`}
          onAnimationEnd={() => {
            if (fadePhase === 'in') setFadePhase('idle')
          }}
        />
      )}
    </>
  )
}
