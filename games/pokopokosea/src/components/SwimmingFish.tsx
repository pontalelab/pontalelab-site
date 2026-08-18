import { useMemo, useState } from 'react';
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
  const [jumping, setJumping] = useState(false);

  const seed = useMemo(
    () => fish.id.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0),
    [fish.id],
  );

  const duration    = 8  + pseudoRandom(seed, 1) * 9;       // 8〜17秒
  const delay       = -(pseudoRandom(seed, 2) * duration);  // ループ内の開始位置をずらす
  const yPercent    = 8  + pseudoRandom(seed, 3) * 58;      // 上から8〜66%
  const fontSize    = 40 + pseudoRandom(seed, 4) * 18;      // 40〜58px
  const bobDuration = 2.5 + pseudoRandom(seed, 5) * 2.0;   // 上下揺れ 2.5〜4.5秒

  const handleClick = () => {
    setJumping(true);
  };

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
        className={['swimming-fish', jumping ? 'swimming-fish--jump' : ''].filter(Boolean).join(' ')}
        style={{
          '--bob-duration': `${bobDuration.toFixed(1)}s`,
          fontSize: `${Math.round(fontSize)}px`,
        } as React.CSSProperties}
        onClick={handleClick}
        onAnimationEnd={(e) => {
          // fishJump（ジャンプ演出）が終わったら通常のswim-bobに戻し、
          // 演出が見えてから詳細画面を開く（先にonClickすると即座に
          // アンマウントされ、ジャンプが再生されないまま消えてしまうため）。
          // swim-bobは無限ループなのでonAnimationEndが呼ばれないため誤って消されない。
          if (e.animationName === 'fishJump') {
            setJumping(false);
            onClick();
          }
        }}
        aria-label={`${fish.name}をみる`}
      >
        {fish.emoji ?? '🐟'}
      </button>
    </div>
  );
}
