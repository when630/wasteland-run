import type { StateCreator } from 'zustand';
import type { BattleState, BattleFlowSlice } from './types';
import { DEFAULT_PLAYER_STATUS } from './types';
import { useRunStore } from '../useRunStore';
import { onBattleReset, onTurnStart } from '../../logic/relicEffects';
import { useDeckStore } from '../useDeckStore';
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

      // 요새화 파워: 매 턴 시작 시 물리 방어도 자동 획득
      const fortifyShield = state.powerFortifyAmount;

      // 유물: 턴 시작 효과
      const relics = useRunStore.getState().relics;
      const turnEffects = onTurnStart(relics, state.turnCount + 1, useRunStore.getState().playerHp, useRunStore.getState().playerMaxHp);

      // 자동 장전기: 탄약 0일 때만
      let turnAmmo = turnEffects.ammo;
      if (relics.includes('auto_loader') && state.playerAmmo === 0) {
        turnAmmo += 1;
      }
      // 모래시계: 매 3턴 AP +1
      if (relics.includes('hourglass') && (state.turnCount + 1) % 3 === 0) {
        startingAp += 1;
      }
      // 아드레날린 자해
      if (turnEffects.selfDamage > 0) {
        useRunStore.getState().damagePlayer(turnEffects.selfDamage);
      }
      // 돌연변이 발톱: 랜덤 적 피해 (set 후 처리 필요 — 별도 디스패치)
      // 추가 드로우: drawCards는 set 후 호출
      const turnExtraDraw = turnEffects.extraDraw;

      // 턴 시작 드로우 예약 (set 이후 setTimeout으로 처리)
      if (turnExtraDraw > 0 || turnAmmo > 0 || turnEffects.randomEnemyDamage > 0) {
        setTimeout(() => {
          if (turnExtraDraw > 0) useDeckStore.getState().drawCards(turnExtraDraw);
          if (turnAmmo > 0) get().addAmmo(turnAmmo);
          if (turnEffects.randomEnemyDamage > 0) {
            const livingEnemies = get().enemies.filter(e => e.currentHp > 0);
            if (livingEnemies.length > 0) {
              const targetIdx = Math.floor(Math.random() * livingEnemies.length);
              get().applyDamageToEnemy(livingEnemies[targetIdx].id, turnEffects.randomEnemyDamage, 'PHYSICAL');
            }
          }
        }, 100);
      }

      return {
        currentTurn: 'PLAYER',
        playerActionPoints: startingAp,
        turnCount: state.turnCount + 1,
        // 방어도/버프 리셋하되 디버프는 유지 (endPlayerTurn에서 감소)
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
        // playerDebuffs 유지 — 적이 부여한 디버프가 플레이어 턴 동안 지속
      };
    });
  },

  endPlayerTurn: () => set((state) => {
    // 플레이어 턴 종료 시 디버프 1턴 감소 (0 이하면 제거)
    const nextDebuffs: Record<string, number> = {};
    Object.entries(state.playerDebuffs).forEach(([key, val]) => {
      if (val > 1) nextDebuffs[key] = val - 1;
    });
    return { currentTurn: 'ENEMY' as const, playerDebuffs: nextDebuffs };
  }),

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
