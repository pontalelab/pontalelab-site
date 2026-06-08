import { useGameState } from './hooks/useGameState';
import { useBgm } from './hooks/useBgm';
import { HomeScreen } from './components/HomeScreen';
import { DifficultySelectScreen } from './components/DifficultySelectScreen';
import { PlayScreen } from './components/PlayScreen';
import { FoundScreen } from './components/FoundScreen';
import { FishDetailScreen } from './components/FishDetailScreen';

export default function App() {
  const {
    screen,
    discoveredFishIds,
    currentFish,
    currentDifficulty,
    isNewDiscovery,
    selectedFish,
    openDifficultySelect,
    startPlay,
    playAgain,
    closeDifficultySelect,
    onFishFound,
    goHome,
    openDetail,
    closeDetail,
    resetGame,
  } = useGameState();

  const { muted, toggleMute } = useBgm();

  return (
    <div className="app-container">
      <button
        className="bgm-button"
        onClick={toggleMute}
        aria-label={muted ? 'おんがくを ならす' : 'おんがくを とめる'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {screen === 'HOME' && (
        <HomeScreen
          discoveredFishIds={discoveredFishIds}
          onStartPlay={openDifficultySelect}
          onFishClick={openDetail}
          onReset={resetGame}
        />
      )}
      {screen === 'DIFFICULTY_SELECT' && (
        <DifficultySelectScreen
          currentDifficultyId={currentDifficulty.id}
          onSelect={startPlay}
          onBack={closeDifficultySelect}
        />
      )}
      {screen === 'PLAY' && currentFish && (
        <PlayScreen
          fish={currentFish}
          difficulty={currentDifficulty}
          onFishFound={onFishFound}
        />
      )}
      {screen === 'FOUND' && currentFish && (
        <FoundScreen
          fish={currentFish}
          isNewDiscovery={isNewDiscovery}
          onPlayAgain={playAgain}
          onGoHome={goHome}
        />
      )}
      {screen === 'DETAIL' && selectedFish && (
        <FishDetailScreen fish={selectedFish} onBack={closeDetail} />
      )}
    </div>
  );
}
