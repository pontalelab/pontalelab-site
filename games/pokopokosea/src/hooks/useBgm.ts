import { useEffect, useRef, useState } from 'react';
import { loadAudioUrl } from './obfuscatedAudio';

// OpenTracks のライセンスに合わせ、変換・難読化した .dat を復号して再生する
const BGM_SRC = `${import.meta.env.BASE_URL}bgm.dat`;
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
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.18;
    audio.muted = loadMuted();
    audioRef.current = audio;
  }

  // ブラウザの自動再生制限のため、操作のタイミングで再生を試み、再生できるまでタップごとに再試行する
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let disposed = false;

    const stop = () => {
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
    function tryPlay() {
      if (!audio || !audio.src || !audio.paused) return;
      audio.play().then(stop).catch(() => {});
    }

    window.addEventListener('pointerdown', tryPlay);
    window.addEventListener('keydown', tryPlay);

    loadAudioUrl(BGM_SRC)
      .then(src => {
        if (disposed) return;
        audio.src = src;
        tryPlay();
      })
      .catch(() => {});

    return () => {
      disposed = true;
      stop();
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
