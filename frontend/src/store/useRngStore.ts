import { create } from 'zustand';
import { SeededRNG, hashString } from '../utils/rng';

interface RngStates {
  intent: number;
  event: number;
  shuffle: number;
  loot: number;
  map: number;
  battle: number;
}

interface RngState {
  intentRng: SeededRNG;
  eventRng: SeededRNG;
  shuffleRng: SeededRNG;
  lootRng: SeededRNG;
  mapRng: SeededRNG;
  battleRng: SeededRNG;

  initialize: (seed: string) => void;
  serializeStates: () => RngStates;
  restoreStates: (states: RngStates) => void;
}

function createSubRng(baseSeed: number, salt: string): SeededRNG {
  return new SeededRNG(baseSeed ^ hashString(salt));
}

const defaultSeed = hashString('default');

export const useRngStore = create<RngState>((set, get) => ({
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

  serializeStates: () => {
    const s = get();
    return {
      intent: s.intentRng.getState(),
      event: s.eventRng.getState(),
      shuffle: s.shuffleRng.getState(),
      loot: s.lootRng.getState(),
      map: s.mapRng.getState(),
      battle: s.battleRng.getState(),
    };
  },

  restoreStates: (states: RngStates) => {
    const s = get();
    s.intentRng.setState(states.intent);
    s.eventRng.setState(states.event);
    s.shuffleRng.setState(states.shuffle);
    s.lootRng.setState(states.loot);
    s.mapRng.setState(states.map);
    s.battleRng.setState(states.battle);
  },
}));
