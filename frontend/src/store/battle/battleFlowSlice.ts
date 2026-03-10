import type { StateCreator } from 'zustand';
import type { BattleState, BattleFlowSlice } from './types';
import { DEFAULT_PLAYER_STATUS } from './types';
import { useRunStore } from '../useRunStore';
import { onBattleReset } from '../../logic/relicEffects';

export const createBattleFlowSlice: StateCreator<BattleState, [], [], BattleFlowSlice> = (set, get) => ({
  currentTurn: 'PLAYER',
  battleResult: 'NONE',
  turnCount: 1,
  targetingCardId: null,
  targetingPosition: null,

  resetBattle: () => {
    const { maxAp, startingAp } = onBattleReset(useRunStore.getState().relics);

    set({
      currentTurn: 'PLAYER',
      battleResult: 'NONE',
      turnCount: 1,
      playerActionPoints: startingAp,
      playerMaxAp: maxAp,
      playerAmmo: 0,
      playerStatus: { ...DEFAULT_PLAYER_STATUS },
      targetingCardId: null,
      targetingPosition: null,
      hasPlayedUtilityThisTurn: false,
      playerHitQueue: [],
      activeEnemyIndex: null,
      powerDefenseAmmo50: false,
      powerPhysicalScalingActive: false,
      powerPhysicalScalingBonus: 0,
      bonusApNextTurn: 0,
      playerDebuffs: {},
    });
  },

  startPlayerTurn: () => {
    if (useRunStore.getState().playerHp <= 0) {
      set({ battleResult: 'DEFEAT' });
      return;
    }

    set((state) => {
      let startingAp = state.playerMaxAp;
      startingAp += state.bonusApNextTurn;

      const nextDebuffs: Record<string, number> = {};
      Object.entries(state.playerDebuffs).forEach(([key, val]) => {
        if (val > 1) nextDebuffs[key] = val - 1;
      });

      return {
        currentTurn: 'PLAYER',
        playerActionPoints: startingAp,
        turnCount: state.turnCount + 1,
        playerStatus: { ...DEFAULT_PLAYER_STATUS },
        targetingCardId: null,
        targetingPosition: null,
        hasPlayedUtilityThisTurn: false,
        playerHitQueue: [],
        activeEnemyIndex: null,
        bonusApNextTurn: 0,
        playerDebuffs: nextDebuffs,
      };
    });
  },

  endPlayerTurn: () => set({ currentTurn: 'ENEMY' }),

  setTargetingCard: (cardId) => set({
    targetingCardId: cardId,
    targetingPosition: cardId === null ? null : get().targetingPosition
  }),

  setTargetingPosition: (pos) => set({ targetingPosition: pos }),
});
