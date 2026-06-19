import type { Fish } from '../types';
import { useFishVoice } from '../hooks/useFishVoice';

interface Props {
  fish: Fish;
  isNewDiscovery: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function FoundScreen({ fish, isNewDiscovery, onPlayAgain, onGoHome }: Props) {
  useFishVoice(fish);

  return (
    <div className="screen found-screen">
      <div className="found-content">
        <div className="found-emoji">{fish.emoji ?? '🐟'}</div>
        <h2 className="found-fish-name">{fish.name}</h2>
        {isNewDiscovery ? (
          <>
            <span className="found-badge">NEW!</span>
            <p className="found-message">あたらしい さかなを はっけん！</p>
          </>
        ) : (
          <p className="found-message">またみつけた！</p>
        )}
      </div>
      <div className="found-buttons">
        <button className="search-again-button" onClick={onPlayAgain}>
          🔍 さかなを さがす
        </button>
        <button className="home-button" onClick={onGoHome}>
          うみに もどる
        </button>
      </div>
    </div>
  );
}
