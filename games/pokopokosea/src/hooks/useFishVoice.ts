import { useEffect } from 'react';
import type { Fish } from '../types';

const VOICE_DELAY_MS = 600;

/** 名前の表示からワンテンポ遅れて、その魚の名前を呼ぶボイスを再生する */
export function useFishVoice(fish: Fish) {
  useEffect(() => {
    const audio = new Audio(`/voice-${fish.id}.wav`);
    const timer = setTimeout(() => {
      audio.play().catch(() => {});
    }, VOICE_DELAY_MS);

    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, [fish.id]);
}
