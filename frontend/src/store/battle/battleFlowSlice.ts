import type { StateCreator } from 'zustand';
import type { BattleState, BattleFlowSlice } from './types';
import { DEFAULT_PLAYER_STATUS } from './types';
import { useRunStore } from '../useRunStore';
import { onBattleReset } from '../../logic/relicEffects';
import { resetVfx } from '../../components/pixi/vfx/vfxDispatcher';

let damageNumberCounter = 0;

export const createBattleFlowSlice: StateCreator<BattleState, [], [], BattleFlowSlice> = (set, get) => ({
  currentTurn: 'PLAYER',
  battleResult: 'NONE',
  turnCount: 1,
  targetingCardId: null,
  targetingPosition: null,
  dragPreviewCardId: null,
  previewTargetEnemyId: null,
  damageNumbers: [],

  resetBattle: () => {
    const { maxAp, startingAp } = onBattleReset(useRunStore.getState().relics);
    resetVfx();

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
      dragPreviewCardId: null,
      previewTargetEnemyId: null,
      hasPlayedUtilityThisTurn: false,
      playerHitQueue: [],
      playerSpriteState: 'IDLE' as const,
      activeEnemyIndex: null,
      damageNumbers: [],
      powerDefenseAmmo50: false,
      powerPhysicalScalingActive: false,
      powerPhysicalScalingBonus: 0,
      bonusApNextTurn: 0,
      playerDebuffs: {},
      powerFortifyAmount: 0,
      powerRageAmount: 0,
      powerFrenzyAmount: 0,
      powerPhoenixAmount: 0,
      nextAttackBonus: 0,
      rampageCounts: {},
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

      // 요새화 파워: 매 턴 시작 시 물리 방어도 자동 획득
      const fortifyShield = state.powerFortifyAmount;

      return {
        currentTurn: 'PLAYER',
        playerActionPoints: startingAp,
        turnCount: state.turnCount + 1,
        playerStatus: { ...DEFAULT_PLAYER_STATUS, shield: fortifyShield },
        targetingCardId: null,
        targetingPosition: null,
        dragPreviewCardId: null,
        previewTargetEnemyId: null,
        hasPlayedUtilityThisTurn: false,
        playerHitQueue: [],
        playerSpriteState: 'IDLE' as const,
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

  setDragPreviewCard: (cardId) => set({ dragPreviewCardId: cardId }),

  setPreviewTargetEnemy: (enemyId) => set({ previewTargetEnemyId: enemyId }),

  pushDamageNumber: (enemyId, amount, color) => {
    const now = Date.now();
    const existing = get().damageNumbers.filter(
      d => d.enemyId === enemyId && now - d.timestamp < 500
    );
    set(state => ({
      damageNumbers: [...state.damageNumbers, {
        id: ++damageNumberCounter,
        enemyId,
        amount,
        color,
        timestamp: now,
        delay: existing.length * 150,
      }]
    }));
  },

  clearExpiredDamageNumbers: () => {
    const now = Date.now();
    set(state => ({
      damageNumbers: state.damageNumbers.filter(d => now - d.timestamp < d.delay + 1000)
    }));
  },
});
