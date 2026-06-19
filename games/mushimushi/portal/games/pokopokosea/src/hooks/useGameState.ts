import { useState } from 'react';
import type { Screen, Fish, DifficultyLevel } from '../types';
import { FISH_MASTER } from '../data/fishMaster';
import { SEA_DEVELOPMENT_MASTER } from '../data/seaDevelopmentMaster';
import { DIFFICULTY_MASTER } from '../data/difficultyMaster';
import { storageService } from '../services/storageService';

function selectTargetFish(discoveredIds: string[]): Fish {
  const undiscovered = FISH_MASTER.filter(f => !discoveredIds.includes(f.id));
  const pool = undiscovered.length > 0 ? undiscovered : FISH_MASTER;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCurrentSeaLevel(speciesCount: number) {
  const sorted = [...SEA_DEVELOPMENT_MASTER].sort((a, b) => b.requiredSpecies - a.requiredSpecies);
  return sorted.find(level => speciesCount >= level.requiredSpecies) ?? SEA_DEVELOPMENT_MASTER[0];
}

export function useGameState() {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [discoveredFishIds, setDiscoveredFishIds] = useState<string[]>(
    () => storageService.load().discoveredFishIds,
  );
  const [currentFish, setCurrentFish] = useState<Fish | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(() => {
    const saved = storageService.load();
    return DIFFICULTY_MASTER.find(d => d.id === saved.lastDifficultyId) ?? DIFFICULTY_MASTER[0];
  });
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);

  const openDifficultySelect = () => {
    setScreen('DIFFICULTY_SELECT');
  };

  const startPlay = (difficulty: DifficultyLevel) => {
    setCurrentDifficulty(difficulty);
    storageService.save({ lastDifficultyId: difficulty.id });
    const fish = selectTargetFish(discoveredFishIds);
    setCurrentFish(fish);
    setScreen('PLAY');
  };

  const playAgain = () => {
    const fish = selectTargetFish(discoveredFishIds);
    setCurrentFish(fish);
    setScreen('PLAY');
  };

  const closeDifficultySelect = () => {
    setScreen('HOME');
  };

  const onFishFound = (fishId: string) => {
    const isNew = !discoveredFishIds.includes(fishId);
    setIsNewDiscovery(isNew);
    if (isNew) {
      const updated = [...discoveredFishIds, fishId];
      setDiscoveredFishIds(updated);
      storageService.save({ discoveredFishIds: updated });
    }
    setScreen('FOUND');
  };

  const goHome = () => {
    setCurrentFish(null);
    setScreen('HOME');
  };

  const openDetail = (fish: Fish) => {
    setSelectedFish(fish);
    setScreen('DETAIL');
  };

  const closeDetail = () => {
    setSelectedFish(null);
    setScreen('HOME');
  };

  const resetGame = () => {
    storageService.clear();
    setDiscoveredFishIds([]);
    setCurrentDifficulty(DIFFICULTY_MASTER[0]);
    setCurrentFish(null);
    setSelectedFish(null);
    setScreen('HOME');
  };

  return {
    screen,
    discoveredFishIds,
    currentFish,
    currentDifficulty,
    isNewDiscovery,
    selectedFish,
    openDifficultySelect,
    startPlay,
    playAgain,
    closeDifficultySelect,
    onFishFound,
    goHome,
    openDetail,
    closeDetail,
    resetGame,
  };
}
