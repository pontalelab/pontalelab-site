import { DIFFICULTY_MASTER } from '../data/difficultyMaster';
import type { DifficultyLevel } from '../types';

interface Props {
  currentDifficultyId: number;
  onSelect: (difficulty: DifficultyLevel) => void;
  onBack: () => void;
}

export function DifficultySelectScreen({ currentDifficultyId, onSelect, onBack }: Props) {
  return (
    <div className="screen difficulty-screen">
      <header className="difficulty-header">
        <button className="back-button" onClick={onBack}>← もどる</button>
        <h2 className="difficulty-title">むずかしさを えらぼう</h2>
      </header>

      <div className="difficulty-list">
        {DIFFICULTY_MASTER.map(d => {
          const isActive = d.id === currentDifficultyId;
          return (
            <button
              key={d.id}
              className={`difficulty-card ${isActive ? 'difficulty-card--active' : ''}`}
              onClick={() => onSelect(d)}
            >
              <span className="difficulty-card-emoji">{d.emoji}</span>
              <div className="difficulty-card-info">
                <p className="difficulty-card-name">{d.name}</p>
                <p className="difficulty-card-age">{d.targetAge}</p>
              </div>
              {isActive && <span className="difficulty-card-badge">まえかい</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
