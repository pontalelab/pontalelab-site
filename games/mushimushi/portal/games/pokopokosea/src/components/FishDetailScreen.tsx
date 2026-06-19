import type { Fish } from '../types';
import { useFishVoice } from '../hooks/useFishVoice';

interface Props {
  fish: Fish;
  onBack: () => void;
}

export function FishDetailScreen({ fish, onBack }: Props) {
  useFishVoice(fish);

  return (
    <div className="screen detail-screen">
      <header className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← もどる
        </button>
        <h2 className="detail-header-title">ずかん</h2>
      </header>

      <div className="detail-content">
        <div className="detail-emoji">{fish.emoji ?? '🐟'}</div>

        <div className="detail-names">
          <p className="detail-display-name">{fish.displayName}</p>
          <p className="detail-name">{fish.name}</p>
        </div>

        {fish.description && (
          <div className="detail-description-box">
            <p className="detail-description">{fish.description}</p>
          </div>
        )}

        <div className="detail-badge">
          <span className="detail-badge-icon">✅</span>
          <span className="detail-badge-text">はっけんずみ</span>
        </div>
      </div>
    </div>
  );
}
