import { useState } from 'react';
import type { Fish, BubbleLetter, DifficultyLevel } from '../types';
import { useSoundEffect } from '../hooks/useSoundEffect';

interface Props {
  fish: Fish;
  difficulty: DifficultyLevel;
  onFishFound: (fishId: string) => void;
}

const HIRAGANA_POOL = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split('');

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateDummies(fishName: string, count: number): string[] {
  const nameChars = new Set(fishName.split(''));
  const available = HIRAGANA_POOL.filter(c => !nameChars.has(c));
  return shuffleArray(available).slice(0, count);
}

function createBubbleLetters(fish: Fish, difficulty: DifficultyLevel): BubbleLetter[] {
  const nameLetters: BubbleLetter[] = fish.name.split('').map((letter, index) => ({
    id: `name-${index}`,
    letter,
    index,
    selected: false,
  }));

  const { dummyMin, dummyMax } = difficulty;
  const dummyCount = dummyMin === dummyMax
    ? dummyMin
    : dummyMin + Math.floor(Math.random() * (dummyMax - dummyMin + 1));

  const dummyLetters: BubbleLetter[] = generateDummies(fish.name, dummyCount).map((letter, i) => ({
    id: `dummy-${i}`,
    letter,
    index: -1,  // -1 は「正解ではない」を意味する。タップすると誤タップ扱いになる
    selected: false,
  }));

  return shuffleArray([...nameLetters, ...dummyLetters]);
}

export function PlayScreen({ fish, difficulty, onFishFound }: Props) {
  const [bubbleLetters, setBubbleLetters] = useState<BubbleLetter[]>(
    () => createBubbleLetters(fish, difficulty),
  );
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const playFoundSound = useSoundEffect('/se-mitsuketa.wav');

  const handleLetterTap = (tapped: BubbleLetter) => {
    if (tapped.selected || isSuccess) return;

    const nextIndex = selectedLetters.length;
    if (tapped.index !== nextIndex) {
      setWrongId(tapped.id);
      setTimeout(() => setWrongId(null), 400);
      return;
    }

    const newSelected = [...selectedLetters, tapped.letter];
    setSelectedLetters(newSelected);
    setBubbleLetters(prev =>
      prev.map(b => b.id === tapped.id ? { ...b, selected: true } : b),
    );

    if (newSelected.length === fish.name.length) {
      setIsSuccess(true);
      playFoundSound();
      setTimeout(() => onFishFound(fish.id), 800);
    }
  };

  return (
    <div className="screen play-screen">
      <h2 className="play-title">なんというさかな？</h2>

      <div className="fish-display">
        <div className="fish-emoji-large">{fish.emoji ?? '🐟'}</div>
      </div>

      <div className="name-slots">
        {fish.name.split('').map((char, i) => (
          <span
            key={i}
            className={`name-slot ${selectedLetters[i] ? 'name-slot--filled' : 'name-slot--empty'}`}
          >
            {selectedLetters[i] ?? <span className="name-slot-hint">{char}</span>}
          </span>
        ))}
      </div>

      <div className="bubble-area">
        {bubbleLetters.map(bubble => (
          <button
            key={bubble.id}
            className={[
              'bubble-button',
              bubble.selected ? 'bubble-button--selected' : '',
              wrongId === bubble.id ? 'bubble-button--wrong' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => handleLetterTap(bubble)}
            disabled={bubble.selected}
          >
            {bubble.letter}
          </button>
        ))}
      </div>

      {isSuccess && (
        <div className="success-overlay">
          <span className="success-text">みつけた！🎉</span>
        </div>
      )}
    </div>
  );
}
