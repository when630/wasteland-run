import { create } from 'zustand';
import { SeededRNG, hashString } from '../utils/rng';

interface RngState {
  intentRng: SeededRNG;
  eventRng: SeededRNG;
  shuffleRng: SeededRNG;
  lootRng: SeededRNG;
  mapRng: SeededRNG;
  battleRng: SeededRNG;

  initialize: (seed: string) => void;
}

function createSubRng(baseSeed: number, salt: string): SeededRNG {
  return new SeededRNG(baseSeed ^ hashString(salt));
}

const defaultSeed = hashString('default');

export const useRngStore = create<RngState>((set) => ({
  intentRng: createSubRng(defaultSeed, 'intent'),
  eventRng: createSubRng(defaultSeed, 'event'),
  shuffleRng: createSubRng(defaultSeed, 'shuffle'),
  lootRng: createSubRng(defaultSeed, 'loot'),
  mapRng: createSubRng(defaultSeed, 'map'),
  battleRng: createSubRng(defaultSeed, 'battle'),

  initialize: (seed: string) => {
    const baseSeed = hashString(seed);
    set({
      intentRng: createSubRng(baseSeed, 'intent'),
      eventRng: createSubRng(baseSeed, 'event'),
      shuffleRng: createSubRng(baseSeed, 'shuffle'),
      lootRng: createSubRng(baseSeed, 'loot'),
      mapRng: createSubRng(baseSeed, 'map'),
      battleRng: createSubRng(baseSeed, 'battle'),
    });
  },
}));
