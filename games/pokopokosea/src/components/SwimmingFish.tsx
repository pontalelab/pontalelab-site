import { useMemo } from 'react';
import type { Fish } from '../types';

interface Props {
  fish: Fish;
  onClick: () => void;
}

function pseudoRandom(seed: number, n: number): number {
  const x = Math.sin(seed * 127 + n * 311) * 100000;
  return x - Math.floor(x); // 0〜1
}

export function SwimmingFish({ fish, onClick }: Props) {
  const seed = useMemo(
    () => fish.id.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0),
    [fish.id],
  );

  const duration    = 8  + pseudoRandom(seed, 1) * 9;       // 8〜17秒
  const delay       = -(pseudoRandom(seed, 2) * duration);  // ループ内の開始位置をずらす
  const yPercent    = 8  + pseudoRandom(seed, 3) * 58;      // 上から8〜66%
  const fontSize    = 40 + pseudoRandom(seed, 4) * 18;      // 40〜58px
  const bobDuration = 2.5 + pseudoRandom(seed, 5) * 2.0;   // 上下揺れ 2.5〜4.5秒

  return (
    <div
      className="swimming-fish-wrapper"
      style={{
        '--swim-duration': `${duration.toFixed(1)}s`,
        '--swim-delay':    `${delay.toFixed(1)}s`,
        '--swim-y':        `${yPercent.toFixed(1)}%`,
      } as React.CSSProperties}
    >
      <button
        className="swimming-fish"
        style={{
          '--bob-duration': `${bobDuration.toFixed(1)}s`,
          fontSize: `${Math.round(fontSize)}px`,
        } as React.CSSProperties}
        onClick={onClick}
        aria-label={`${fish.name}をみる`}
      >
        {fish.emoji ?? '🐟'}
      </button>
    </div>
  );
}
