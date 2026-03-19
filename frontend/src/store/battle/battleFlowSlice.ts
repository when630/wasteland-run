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
      // 보급품 턴 효과 리셋
      supplyAttackBonusTurn: 0,
      supplyFirstSpecialBonus: 0,
      supplyDmgReductionFlat: 0,
      supplyDmgReductionPercent: 0,
      supplyDmgReductionPercentTurns: 0,
      supplyRegenPerTurn: 0,
      supplyRegenTurns: 0,
      supplyBerserkerSelfDmg: 0,
      supplyExtraTurn: false,
      supplyTempMaxHp: 0,
    });
    // 전투 종료 시 임시 최대HP 복원
    const tempHp = get().supplyTempMaxHp;
    if (tempHp > 0) {
      const run = useRunStore.getState();
      useRunStore.setState({ playerMaxHp: run.playerMaxHp - tempHp });
    }
  },

  startPlayerTurn: () => {
    if (useRunStore.getState().playerHp <= 0) {
      set({ battleResult: 'DEFEAT' });
      return;
    }

    // [불안정한 텔레포터] 매 턴 드로우 전 덱 셔플
    const relicsForShuffle = useRunStore.getState().relics;
    if (relicsForShuffle.includes('unstable_teleporter')) {
      useDeckStore.getState().shuffleDrawPile();
    }

    // 보급품 리젠 효과 (턴 시작 전 적용)
    const prevState = get();
    if (prevState.supplyRegenTurns > 0 && prevState.supplyRegenPerTurn > 0) {
      useRunStore.getState().healPlayer(prevState.supplyRegenPerTurn);
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
      // 아드레날린 자해 ([혈압 조절기] 보유 시 50% 감소)
      if (turnEffects.selfDamage > 0) {
        const selfDmg = relics.includes('blood_regulator')
          ? Math.floor(turnEffects.selfDamage * 0.5)
          : turnEffects.selfDamage;
        if (selfDmg > 0) useRunStore.getState().damagePlayer(selfDmg);
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
        // 보급품: 매 턴 리셋되는 효과
        supplyAttackBonusTurn: 0,
        supplyFirstSpecialBonus: 0,
        supplyDmgReductionFlat: 0,
        supplyBerserkerSelfDmg: 0,
        supplyExtraTurn: false,
        // 보급품: 다수 턴 효과 감소
        supplyDmgReductionPercentTurns: Math.max(0, state.supplyDmgReductionPercentTurns - 1),
        supplyDmgReductionPercent: state.supplyDmgReductionPercentTurns - 1 > 0 ? state.supplyDmgReductionPercent : 0,
        supplyRegenTurns: Math.max(0, state.supplyRegenTurns - 1),
        supplyRegenPerTurn: state.supplyRegenTurns - 1 > 0 ? state.supplyRegenPerTurn : 0,
      };
    });
  },

  endPlayerTurn: () => {
    const relics = useRunStore.getState().relics;
    const currentState = get();
    const hand = useDeckStore.getState().hand;

    // [전술 조끼] 턴 종료 시 손패 0장이면 다음 턴 드로우 +2
    let bonusDraw = 0;
    if (relics.includes('tactical_vest') && hand.length === 0) {
      bonusDraw += 2;
    }
    // [영구 운동 장치] 턴 종료 시 손패 4장 이상(≈카드 1장 이하 사용)이면 다음 턴 드로우 2
    if (relics.includes('perpetual_engine') && hand.length >= 4) {
      bonusDraw += 2;
    }
    // [자기장 코일] 턴 종료 시 미사용 AP 1당 물리+특수 방어도 3
    if (relics.includes('magnetic_coil') && currentState.playerActionPoints > 0) {
      const shieldAmount = currentState.playerActionPoints * 3;
      get().addPlayerShield(shieldAmount);
      get().addPlayerResist(shieldAmount);
    }
    // [양자 코어] 턴 종료 시 손패 1장 랜덤 소멸
    if (relics.includes('quantum_core') && hand.length > 0) {
      const idx = Math.floor(Math.random() * hand.length);
      useDeckStore.getState().exhaustCardFromHand(hand[idx].id);
    }

    // 다음 턴 추가 드로우 예약
    if (bonusDraw > 0) {
      setTimeout(() => useDeckStore.getState().drawCards(bonusDraw), 200);
    }

    // 화상 카드: 손패에 있으면 장당 2 데미지
    const burnCount = hand.filter(c => c.type === 'STATUS_BURN').length;
    if (burnCount > 0) {
      useRunStore.getState().damagePlayer(burnCount * 2);
      useRunStore.getState().setToastMessage(`화상! 손패의 화상 카드 ${burnCount}장으로 ${burnCount * 2} 피해!`);
    }

    // 보급품: 광전사 혈청 자해
    if (currentState.supplyBerserkerSelfDmg > 0) {
      useRunStore.getState().damagePlayer(currentState.supplyBerserkerSelfDmg);
    }

    // 보급품: 추가 턴 (시간 왜곡기)
    const hasExtraTurn = currentState.supplyExtraTurn;

    // 디버프 1턴 감소
    set((state) => {
      const nextDebuffs: Record<string, number> = {};
      Object.entries(state.playerDebuffs).forEach(([key, val]) => {
        if (val > 1) nextDebuffs[key] = val - 1;
      });
      return { currentTurn: hasExtraTurn ? 'PLAYER' as const : 'ENEMY' as const, playerDebuffs: nextDebuffs };
    });

    // 추가 턴이면 즉시 새 턴 시작
    if (hasExtraTurn) {
      setTimeout(() => get().startPlayerTurn(), 100);
    }
  },

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
