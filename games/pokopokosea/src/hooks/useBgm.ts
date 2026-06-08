import { useEffect, useRef, useState } from 'react';

const BGM_SRC = '/bgm.mp3';
const MUTE_KEY = 'pokopoko-sea-bgm-muted';

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useBgm() {
  const [muted, setMuted] = useState(loadMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    const audio = new Audio(BGM_SRC);
    audio.loop = true;
    audio.volume = 0.18;
    audio.muted = loadMuted();
    audioRef.current = audio;
  }

  // ブラウザの自動再生制限のため、初回操作のタイミングで再生を試みる
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tryPlay = () => {
      audio.play().catch(() => {});
    };
    tryPlay();

    window.addEventListener('pointerdown', tryPlay, { once: true });
    window.addEventListener('keydown', tryPlay, { once: true });

    return () => {
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
  }, [muted]);

  const toggleMute = () => {
    setMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_KEY, String(next));
      } catch {
        // 保存に失敗しても再生制御は継続する
      }
      return next;
    });
  };

  return { muted, toggleMute };
}
