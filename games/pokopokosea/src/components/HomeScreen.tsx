import { useState } from 'react';
import type { Fish } from '../types';
import { FISH_MASTER } from '../data/fishMaster';
import { getCurrentSeaLevel } from '../hooks/useGameState';
import { SwimmingFish } from './SwimmingFish';

interface Props {
  discoveredFishIds: string[];
  onStartPlay: () => void;
  onFishClick: (fish: Fish) => void;
  onReset: () => void;
}

const SEA_STYLES: Record<string, { bg: string; image: string; label: string }> = {
  sand:    { bg: '#C8E6F5', image: '/bg-sand.png',    label: 'すなはまのうみ' },
  seaweed: { bg: '#68C777', image: '/bg-seaweed.png', label: 'わかめのうみ' },
  coral:   { bg: '#29B5E8', image: '/bg-coral.png',   label: 'さんごのうみ' },
};

export function HomeScreen({ discoveredFishIds, onStartPlay, onFishClick, onReset }: Props) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const seaLevel = getCurrentSeaLevel(discoveredFishIds.length);
  const seaStyle = SEA_STYLES[seaLevel.background] ?? SEA_STYLES.sand;
  const discoveredFish = FISH_MASTER.filter(f => discoveredFishIds.includes(f.id));

  const handleResetConfirm = () => {
    setShowResetConfirm(false);
    onReset();
  };

  return (
    <div
      className="screen home-screen"
      style={{
        backgroundColor: seaStyle.bg,
        backgroundImage: `url(${seaStyle.image})`,
      }}
    >
      <header className="home-header">
        <h1 className="home-title">ポコポコ海の図鑑</h1>
        <p className="sea-label">{seaStyle.label}</p>
        <p className="species-count">
          <span className="count-num">{discoveredFishIds.length}</span>
          <span className="count-sep"> / </span>
          <span className="count-total">{FISH_MASTER.length}</span>
          <span className="count-unit"> しゅるい</span>
        </p>
        <button
          className="settings-button"
          onClick={() => setShowResetConfirm(true)}
          aria-label="設定"
        >
          ⚙️
        </button>
      </header>

      <div className="sea-area">
        {discoveredFish.length === 0 ? (
          <div className="empty-sea">
            <p className="empty-message">さかなを さがしに いこう！</p>
          </div>
        ) : (
          discoveredFish.map(fish => (
            <SwimmingFish key={fish.id} fish={fish} onClick={() => onFishClick(fish)} />
          ))
        )}
      </div>

      <footer className="home-footer">
        <button className="start-button" onClick={onStartPlay}>
          🔍 さかなを さがす！
        </button>
      </footer>

      {showResetConfirm && (
        <div className="reset-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="reset-dialog" onClick={e => e.stopPropagation()}>
            <p className="reset-dialog-title">⚠️ リセット</p>
            <p className="reset-dialog-text">データを ぜんぶ けしますか？</p>
            <p className="reset-dialog-sub">みつけた さかなも きえます</p>
            <div className="reset-dialog-buttons">
              <button
                className="reset-cancel-btn"
                onClick={() => setShowResetConfirm(false)}
              >
                いいえ
              </button>
              <button
                className="reset-confirm-btn"
                onClick={handleResetConfirm}
              >
                はい・けす
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
