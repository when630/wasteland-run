import { create } from 'zustand';
import type { Enemy, DamageType } from '../types/enemyTypes';
import { useRunStore } from './useRunStore';
import { useDeckStore } from './useDeckStore';
import { determineNextIntent } from '../assets/data/enemies';
import { STATUS_CARDS } from '../assets/data/cards';

export type { DamageType } from '../types/enemyTypes';

type TurnState = 'PLAYER' | 'ENEMY' | 'RESOLVE';
type BattleResult = 'NONE' | 'VICTORY' | 'DEFEAT';

interface PlayerBattleStatus {
  shield: number;
  resist: number;
  // 턴 한정 버프/디버프
  nextPhysicalFree: boolean;          // 다음 물리 공격 AP 0
  cannotPlayPhysicalAttack: boolean;  // 이번 턴 물리 공격 불가
  retainCardCount: number;            // 턴 종료 시 보존할 카드 수
  reflectPhysical: number;            // 물리 피격 시 반사 데미지
  apOnSpecialDefend: number;          // 특수 방어 시 다음 턴 AP 추가량
  ammoOnSpecialDefend: number;        // 특수 방어 시 탄약 획득량
  markOfFate: { enemyId: string; healAmount: number; ammoAmount: number } | null;
}

interface BattleState {
  currentTurn: TurnState;
  battleResult: BattleResult;
  turnCount: number;
  playerActionPoints: number;
  playerAmmo: number;
  playerStatus: PlayerBattleStatus;
  enemies: Enemy[];
  targetingCardId: string | null;
  targetingPosition: { x: number, y: number } | null;
  hasPlayedUtilityThisTurn: boolean;
  playerHitQueue: Array<{ type: 'DAMAGE' | 'BURN' | 'POISON' }>;
  activeEnemyIndex: number | null;

  // 전투 지속 효과 (Power)
  powerDefenseAmmo50: boolean;
  powerPhysicalScalingActive: boolean;
  powerPhysicalScalingBonus: number;

  // 다음 턴 보너스 AP (적 턴 중 누적, startPlayerTurn에서 소비)
  bonusApNextTurn: number;

  // 플레이어 디버프 (턴 수 기반, 매 턴 시작 시 감소)
  playerDebuffs: Record<string, number>;

  // Actions
  startPlayerTurn: () => void;
  endPlayerTurn: () => void;
  consumeAp: (amount: number) => boolean;
  addAmmo: (amount: number) => void;
  spawnEnemies: (enemyArray: Enemy[]) => void;
  resetBattle: () => void;

  // Combat Actions
  addPlayerShield: (amount: number) => void;
  addPlayerResist: (amount: number) => void;
  applyDamageToEnemy: (enemyId: string, amount: number, type: DamageType) => void;
  applyStatusToEnemy: (enemyId: string, status: string, amount: number) => void;
  executeOneEnemyTurn: (enemyIndex: number) => void;
  setActiveEnemyIndex: (index: number | null) => void;
  setTargetingCard: (cardId: string | null) => void;
  setTargetingPosition: (pos: { x: number, y: number } | null) => void;
  setPlayedUtilityThisTurn: (value: boolean) => void;
  consumePlayerHitQueue: () => void;

  // 카드 효과용 setter
  setPlayerStatusField: (field: Partial<PlayerBattleStatus>) => void;
  setMarkOfFate: (enemyId: string, healAmount: number, ammoAmount: number) => void;
  setPowerDefenseAmmo50: (active: boolean) => void;
  setPowerPhysicalScaling: (active: boolean) => void;
  addPhysicalScalingBonus: (amount: number) => void;
}

const DEFAULT_PLAYER_STATUS: PlayerBattleStatus = {
  shield: 0, resist: 0,
  nextPhysicalFree: false,
  cannotPlayPhysicalAttack: false,
  retainCardCount: 0,
  reflectPhysical: 0,
  apOnSpecialDefend: 0,
  ammoOnSpecialDefend: 0,
  markOfFate: null,
};

export const useBattleStore = create<BattleState>((set, get) => ({
  currentTurn: 'PLAYER',
  battleResult: 'NONE',
  turnCount: 1,
  playerActionPoints: 3,
  playerAmmo: 0,
  playerStatus: { ...DEFAULT_PLAYER_STATUS },
  enemies: [],
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

  resetBattle: () => {
    const relics = useRunStore.getState().relics;
    let startingAp = 3;
    if (relics.includes('glow_watch')) startingAp += 1;
    if (relics.includes('arc_heart')) startingAp += 1;

    set({
      currentTurn: 'PLAYER',
      battleResult: 'NONE',
      turnCount: 1,
      playerActionPoints: startingAp,
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
      const relics = useRunStore.getState().relics;
      let startingAp = 3;
      if (relics.includes('arc_heart')) startingAp += 1;

      // 다음 턴 보너스 AP 적용 (AP_ON_SPECIAL_DEFEND 등)
      startingAp += state.bonusApNextTurn;

      // 플레이어 디버프 턴 수 감소
      const nextDebuffs: Record<string, number> = {};
      Object.entries(state.playerDebuffs).forEach(([key, val]) => {
        if (val > 1) nextDebuffs[key] = val - 1;
      });

      return {
        currentTurn: 'PLAYER',
        playerActionPoints: startingAp,
        turnCount: state.turnCount + 1,
        // 턴 한정 상태 초기화, shield/resist 리셋
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

  consumeAp: (amount: number) => {
    const { playerActionPoints } = get();
    if (playerActionPoints >= amount) {
      set({ playerActionPoints: playerActionPoints - amount });
      return true;
    }
    return false;
  },

  addAmmo: (amount: number) => set((state) => ({
    playerAmmo: state.playerAmmo + amount
  })),

  spawnEnemies: (enemyArray: Enemy[]) => set({ enemies: enemyArray }),
  setTargetingCard: (cardId: string | null) => set({ targetingCardId: cardId, targetingPosition: cardId === null ? null : get().targetingPosition }),
  setTargetingPosition: (pos: { x: number, y: number } | null) => set({ targetingPosition: pos }),
  setPlayedUtilityThisTurn: (value: boolean) => set({ hasPlayedUtilityThisTurn: value }),
  consumePlayerHitQueue: () => set((state) => ({
    playerHitQueue: state.playerHitQueue.slice(1)
  })),

  // 카드 효과용 setter
  setPlayerStatusField: (field) => set((state) => ({
    playerStatus: { ...state.playerStatus, ...field }
  })),
  setMarkOfFate: (enemyId, healAmount, ammoAmount) => set((state) => ({
    playerStatus: { ...state.playerStatus, markOfFate: { enemyId, healAmount, ammoAmount } }
  })),
  setPowerDefenseAmmo50: (active) => set({ powerDefenseAmmo50: active }),
  setPowerPhysicalScaling: (active) => set({ powerPhysicalScalingActive: active }),
  addPhysicalScalingBonus: (amount) => set((state) => ({
    powerPhysicalScalingBonus: state.powerPhysicalScalingBonus + amount
  })),

  /* --- 전투 액션 함수 --- */

  addPlayerShield: (amount: number) => set((state) => ({
    playerStatus: { ...state.playerStatus, shield: state.playerStatus.shield + amount }
  })),

  addPlayerResist: (amount: number) => set((state) => ({
    playerStatus: { ...state.playerStatus, resist: state.playerStatus.resist + amount }
  })),

  applyStatusToEnemy: (enemyId: string, status: string, amount: number) => {
    set((state) => ({
      enemies: state.enemies.map(enemy => {
        if (enemy.id !== enemyId) return enemy;
        const currentStatuses = enemy.statuses || {};
        return {
          ...enemy,
          statuses: {
            ...currentStatuses,
            [status]: (currentStatuses[status] || 0) + amount
          }
        };
      })
    }));
  },

  applyDamageToEnemy: (enemyId: string, amount: number, type: DamageType) => {
    set((state) => {
      const newEnemies = state.enemies.map(enemy => {
        if (enemy.id !== enemyId) return enemy;

        let finalAmount = amount;
        if (enemy.statuses?.VULNERABLE && enemy.statuses.VULNERABLE > 0) {
          finalAmount = Math.floor(finalAmount * 1.5);
        }

        let remainingDamage = finalAmount;
        let newShield = enemy.shield;
        let newResist = enemy.resist;

        if (type === 'PHYSICAL' && newShield > 0) {
          if (newShield >= remainingDamage) {
            newShield -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newShield;
            newShield = 0;
          }
        }

        if (type === 'SPECIAL' && newResist > 0) {
          if (newResist >= remainingDamage) {
            newResist -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newResist;
            newResist = 0;
          }
        }

        let newHp = enemy.currentHp - remainingDamage;
        if (newHp < 0) newHp = 0;

        const actualDamage = enemy.currentHp - newHp;
        if (actualDamage > 0) {
          useRunStore.getState().addDamageDealt(actualDamage);
        }

        // 유물: [구시대의 구급상자] 특수 공격으로 처치 시 체력 3 회복
        if (newHp === 0 && enemy.currentHp > 0 && type === 'SPECIAL') {
          if (useRunStore.getState().relics.includes('old_medkit')) {
            useRunStore.getState().healPlayer(3);
          }
        }

        // 약육강식(MARK_OF_FATE): 마킹된 적이 사망하면 회복 + 탄약
        if (newHp === 0 && enemy.currentHp > 0) {
          const mark = state.playerStatus.markOfFate;
          if (mark && mark.enemyId === enemyId) {
            useRunStore.getState().healPlayer(mark.healAmount);
            get().addAmmo(mark.ammoAmount);
            useRunStore.getState().setToastMessage(`약육강식 발동 -- 체력 ${mark.healAmount} 회복, 탄약 ${mark.ammoAmount} 획득!`);
          }
        }

        return {
          ...enemy,
          shield: newShield,
          resist: newResist,
          currentHp: newHp,
          visualEffect: { type: 'DAMAGE' as const, tick: Date.now() }
        };
      });

      const isVictory = newEnemies.every(e => e.currentHp <= 0);

      if (isVictory) {
        useRunStore.getState().addEnemiesKilled(newEnemies.length);

        const isBossDefeated = newEnemies.some(e => e.baseId.includes('boss'));

        if (isBossDefeated) {
          const runStore = useRunStore.getState();
          const startTime = runStore.runStartTime || Date.now();
          const playTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
          const hpScore = runStore.playerHp * 10;
          const timePenalty = Math.max(0, playTimeSeconds - 300);
          let finalScore = 1000 + hpScore - timePenalty;
          if (finalScore < 0) finalScore = 0;

          Promise.all([
            import('./useMapStore'),
            import('../api/auth')
          ]).then(([{ useMapStore }, { authApi }]) => {
            const submitData = {
              score: finalScore,
              clearLayer: useMapStore.getState().currentFloor,
              playTimeSeconds
            };
            authApi.post('/leaderboard', submitData).catch(err => {
              console.error("리더보드 점수 등록 실패", err);
            });
          });
        }

        return { enemies: newEnemies, battleResult: 'VICTORY' };
      }

      return { enemies: newEnemies };
    });
  },

  setActiveEnemyIndex: (index: number | null) => set({ activeEnemyIndex: index }),

  // 적 1체 행동 실행 (순차 연출용)
  executeOneEnemyTurn: (enemyIndex: number) => {
    set((state) => {
      let currentShield = state.playerStatus.shield;
      let currentResist = state.playerStatus.resist;
      const hitQueue: Array<{ type: 'DAMAGE' | 'BURN' | 'POISON' }> = [];
      let reflectPhysical = state.playerStatus.reflectPhysical;
      let ammoOnSpecialDefend = state.playerStatus.ammoOnSpecialDefend;
      let bonusApNextTurn = state.bonusApNextTurn;
      let ammoGained = 0;

      const enemy = state.enemies[enemyIndex];
      if (!enemy || enemy.currentHp <= 0) return {};

      let currentHp = enemy.currentHp;
      let currentStatuses = { ...(enemy.statuses || {}) };

      // 1. 상태이상 데미지 처리
      let statusVfx: { type: 'DAMAGE' | 'BUFF' | 'BURN_TICK' | 'POISON_TICK' | 'BURN_POISON_TICK' | 'ATTACKING'; tick: number } | undefined = undefined;
      const hasBurn = currentStatuses.BURN && currentStatuses.BURN > 0;
      const hasPoison = currentStatuses.POISON && currentStatuses.POISON > 0;
      if (hasBurn) currentHp -= currentStatuses.BURN * 3;
      if (hasPoison) currentHp -= currentStatuses.POISON;
      if (hasBurn && hasPoison) {
        statusVfx = { type: 'BURN_POISON_TICK', tick: Date.now() };
      } else if (hasBurn) {
        statusVfx = { type: 'BURN_TICK', tick: Date.now() };
      } else if (hasPoison) {
        statusVfx = { type: 'POISON_TICK', tick: Date.now() };
      }

      if (currentHp <= 0) {
        const newEnemies = [...state.enemies];
        newEnemies[enemyIndex] = { ...enemy, currentHp: 0, statuses: {}, currentIntent: null, visualEffect: statusVfx };

        // 상태이상 사망 시에도 MARK_OF_FATE 체크
        const mark = state.playerStatus.markOfFate;
        if (mark && mark.enemyId === enemy.id) {
          useRunStore.getState().healPlayer(mark.healAmount);
          ammoGained += mark.ammoAmount;
          useRunStore.getState().setToastMessage(`약육강식 발동 -- 체력 ${mark.healAmount} 회복, 탄약 ${mark.ammoAmount} 획득!`);
        }

        return {
          enemies: newEnemies,
          playerAmmo: state.playerAmmo + ammoGained,
          playerStatus: { ...state.playerStatus, shield: currentShield, resist: currentResist },
        };
      }

      let enemyObj = { ...enemy, currentHp, visualEffect: statusVfx };

      // 2. 행동 처리
      if (enemyObj.currentIntent) {
        if (enemyObj.currentIntent.type === 'ATTACK' && enemyObj.currentIntent.amount) {
          const isSpecial = enemyObj.currentIntent.damageType === 'SPECIAL';

          let rawDamage = enemyObj.currentIntent.amount;
          let hitCount = 1;

          // 다단 히트 패턴 파싱 (NxM 형태)
          const multiHitMatch = enemyObj.currentIntent.description.match(/(\d+)x(\d+)/);
          if (multiHitMatch) {
            rawDamage = parseInt(multiHitMatch[1], 10);
            hitCount = parseInt(multiHitMatch[2], 10);
          }

          if (currentStatuses.WEAK && currentStatuses.WEAK > 0) {
            rawDamage = Math.floor(rawDamage * 0.75);
          }

          // 플레이어 VULNERABLE: 받는 피해 50% 증가
          if (state.playerDebuffs.VULNERABLE && state.playerDebuffs.VULNERABLE > 0) {
            rawDamage = Math.floor(rawDamage * 1.5);
          }

          let totalDamageToPlayer = 0;
          let specialDefended = false; // 특수 방어 발동 여부 추적

          for (let i = 0; i < hitCount; i++) {
            let damageToPlayer = rawDamage;

            if (isSpecial) {
              if (currentResist > 0) {
                specialDefended = true; // 특수 방어 발동
                if (currentResist >= damageToPlayer) {
                  currentResist -= damageToPlayer;
                  damageToPlayer = 0;
                } else {
                  damageToPlayer -= currentResist;
                  currentResist = 0;
                }
              }
            } else {
              if (currentShield > 0) {
                if (currentShield >= damageToPlayer) {
                  currentShield -= damageToPlayer;
                  damageToPlayer = 0;
                } else {
                  damageToPlayer -= currentShield;
                  currentShield = 0;
                }
              }
            }

            totalDamageToPlayer += damageToPlayer;

            if (damageToPlayer > 0) {
              const desc = enemyObj.currentIntent?.description || '';
              let hitType: 'DAMAGE' | 'BURN' | 'POISON' = 'DAMAGE';
              if (desc.includes('☣️') || desc.includes('산성') || desc.includes('독') || desc.includes('맹독')) {
                hitType = 'POISON';
              } else if (desc.includes('소이탄') || desc.includes('화상') || desc.includes('🔥') || desc.includes('화염')) {
                hitType = 'BURN';
              }
              hitQueue.push({ type: hitType });
            }
          }

          // 물리 반사 데미지 (REFLECT_PHYSICAL)
          if (!isSpecial && reflectPhysical > 0 && totalDamageToPlayer > 0) {
            enemyObj = {
              ...enemyObj,
              currentHp: Math.max(0, enemyObj.currentHp - reflectPhysical),
            };
            useRunStore.getState().addDamageDealt(Math.min(reflectPhysical, enemyObj.currentHp + reflectPhysical));
          }

          // 특수 방어 시 탄약 획득 (AMMO_ON_SPECIAL_DEFEND)
          if (isSpecial && specialDefended && ammoOnSpecialDefend > 0) {
            ammoGained += ammoOnSpecialDefend;
          }

          // 특수 공격 방어 시 다음 턴 AP 추가 (AP_ON_SPECIAL_DEFEND)
          if (isSpecial && specialDefended && state.playerStatus.apOnSpecialDefend > 0) {
            bonusApNextTurn += state.playerStatus.apOnSpecialDefend;
          }

          if (totalDamageToPlayer > 0) {
            useRunStore.getState().damagePlayer(totalDamageToPlayer);
            useRunStore.getState().addDamageTaken(totalDamageToPlayer);

            if (enemyObj.currentIntent!.description.includes('소이탄')) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...burnBlueprint } = STATUS_CARDS[0];
              useDeckStore.getState().addCardToDiscardPile(burnBlueprint);
              useRunStore.getState().setToastMessage('오염물질 침투 — 덱에 [화상] 카드가 섞여들었다!');
            }

            // 피격 시 디버프 부여 (예: 뮤턴트 비히모스 "묵직한 내려찍기" -> 취약)
            if (enemyObj.currentIntent!.applyDebuff) {
              const { status, amount } = enemyObj.currentIntent!.applyDebuff;
              const currentDebuffs = get().playerDebuffs;
              set({ playerDebuffs: { ...currentDebuffs, [status]: (currentDebuffs[status] || 0) + amount } });
              useRunStore.getState().setToastMessage(`${enemyObj.name}의 공격! ${status} ${amount}턴 부여!`);
            }
          }
        } else if (enemyObj.currentIntent.type === 'BUFF' && enemyObj.currentIntent.amount) {
          enemyObj = {
            ...enemyObj,
            shield: enemyObj.shield + enemyObj.currentIntent.amount,
            visualEffect: { type: 'BUFF' as const, tick: Date.now() }
          };
        }
      }

      // 3. 상태이상 감소 및 다음 의도
      const nextStatuses: Record<string, number> = {};
      Object.entries(currentStatuses).forEach(([key, val]) => {
        if (val > 1) nextStatuses[key] = val - 1;
      });

      const updatedEnemy = {
        ...enemyObj,
        statuses: nextStatuses,
        currentIntent: determineNextIntent(enemyObj.baseId),
        visualEffect: (enemyObj.visualEffect?.type && enemyObj.visualEffect.type !== 'DAMAGE')
          ? enemyObj.visualEffect : undefined
      };

      const newEnemies = [...state.enemies];
      newEnemies[enemyIndex] = updatedEnemy;

      const isDefeat = useRunStore.getState().playerHp <= 0;

      return {
        enemies: newEnemies,
        playerAmmo: state.playerAmmo + ammoGained,
        playerStatus: { ...state.playerStatus, shield: currentShield, resist: currentResist },
        battleResult: isDefeat ? 'DEFEAT' : state.battleResult,
        playerHitQueue: [...state.playerHitQueue, ...hitQueue],
        bonusApNextTurn,
      };
    });
  },
}));
