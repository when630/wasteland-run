import { create } from 'zustand';
import type { Enemy } from '../types/enemyTypes';
import { useRunStore } from './useRunStore';
import { useDeckStore } from './useDeckStore';
import { determineNextIntent } from '../assets/data/enemies';
import { STATUS_CARDS } from '../assets/data/cards';

type TurnState = 'PLAYER' | 'ENEMY' | 'RESOLVE';
type BattleResult = 'NONE' | 'VICTORY' | 'DEFEAT';

// 이펙트 판정 용 타입
export type DamageType = 'PHYSICAL' | 'SPECIAL' | 'PIERCING';

interface PlayerBattleStatus {
  shield: number; // 물리 방어 버프
  resist: number; // 특수 방어 버프
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
  targetingPosition: { x: number, y: number } | null; // 🌟 카드를 클릭했을 때 타겟팅 화살표의 시작점
  hasPlayedUtilityThisTurn: boolean; // 🌟 아크 심장 유물 용: 이번 턴에 변화 카드를 사용했는지 추적
  playerHitQueue: number; // 🌟 다단 히트 연출용 남은 애니메이션 횟수 큐

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
  executeEnemyTurns: () => void; // 적 AI 행동 실행 트리거
  setTargetingCard: (cardId: string | null) => void;
  setTargetingPosition: (pos: { x: number, y: number } | null) => void; // 🌟 위치 셋업용
  setPlayedUtilityThisTurn: (value: boolean) => void; // 🌟 아크 심장 용 상태 업데이트
  consumePlayerHitQueue: () => void; // 🌟 큐 1회 소모
}

export const useBattleStore = create<BattleState>((set, get) => ({
  currentTurn: 'PLAYER',
  battleResult: 'NONE',
  turnCount: 1,
  playerActionPoints: 3,
  playerAmmo: 0,
  playerStatus: { shield: 0, resist: 0 },
  enemies: [],
  targetingCardId: null,
  targetingPosition: null,
  hasPlayedUtilityThisTurn: false,
  playerHitQueue: 0,

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
      playerStatus: { shield: 0, resist: 0 },
      targetingCardId: null,
      targetingPosition: null,
      hasPlayedUtilityThisTurn: false,
      playerHitQueue: 0
    });
  },

  startPlayerTurn: () => {
    // 플레이어 턴 시작 전 사망 여부 다시 검증 (중복 체크)
    if (useRunStore.getState().playerHp <= 0) {
      set({ battleResult: 'DEFEAT' });
      return;
    }

    set((state) => {
      const relics = useRunStore.getState().relics;
      let startingAp = 3;
      // glow_watch는 turnCount 1에 제한된 초동 유물이므로 여기서는 아크 심장만 적용
      if (relics.includes('arc_heart')) startingAp += 1;

      return {
        currentTurn: 'PLAYER',
        playerActionPoints: startingAp,
        turnCount: state.turnCount + 1,
        playerStatus: { shield: 0, resist: 0 },
        targetingCardId: null,
        targetingPosition: null,
        hasPlayedUtilityThisTurn: false, // 🌟 매 턴 시작 시 초기화
        playerHitQueue: 0
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
    playerHitQueue: Math.max(0, state.playerHitQueue - 1)
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

  // 적에게 물리/특수 데미지 가함. 쉴드나 저항부터 까고 남은 수치만큼 체력 차감
  applyDamageToEnemy: (enemyId: string, amount: number, type: DamageType) => {
    set((state) => {
      const newEnemies = state.enemies.map(enemy => {
        if (enemy.id !== enemyId) return enemy;

        // VULNERABLE 처리 (받는 데미지 50% 증가)
        let finalAmount = amount;
        if (enemy.statuses?.VULNERABLE && enemy.statuses.VULNERABLE > 0) {
          finalAmount = Math.floor(finalAmount * 1.5);
        }

        let remainingDamage = finalAmount;
        let newShield = enemy.shield;
        let newResist = enemy.resist;

        // 물리 방어 계산: PHYSICAL 데미지만 깎임 (관통 연산 제외)
        if (type === 'PHYSICAL' && newShield > 0) {
          if (newShield >= remainingDamage) {
            newShield -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newShield;
            newShield = 0;
          }
        }

        // 특수 방어 계산: SPECIAL 데미지만 깎임
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
        if (newHp < 0) newHp = 0; // 최소 HP 0 보정 (추후 사망 처리 로직 발동용)

        // 🌟 유물 효과: [구시대의 구급상자] 특수(SPECIAL) 공격으로 처치 시 체력 3 회복
        if (newHp === 0 && enemy.currentHp > 0 && type === 'SPECIAL') {
          if (useRunStore.getState().relics.includes('old_medkit')) {
            useRunStore.getState().healPlayer(3);
          }
        }

        return {
          ...enemy,
          shield: newShield,
          resist: newResist,
          currentHp: newHp,
          visualEffect: { type: 'DAMAGE' as const, tick: Date.now() } // 🌟 피격 애니메이션 트리거
        };
      });

      const isVictory = newEnemies.every(e => e.currentHp <= 0);

      if (isVictory) {
        // 전투에서 승리 시 현재 노드의 적 수만큼 처치 카운트 증가
        useRunStore.getState().addEnemiesKilled(newEnemies.length);

        // 보스 클리어 여부 확인 (id나 baseId에 boss 포함 여부 등)
        const isBossDefeated = newEnemies.some(e => e.baseId.includes('boss'));

        if (isBossDefeated) {
          const runStore = useRunStore.getState();

          const startTime = (runStore as any).runStartTime || Date.now();
          const playTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

          // 점수 산정 임시 식 (남은 체력 가중치 + 플탐 가중치 등)
          const hpScore = runStore.playerHp * 10;
          const timePenalty = Math.max(0, playTimeSeconds - 300); // 5분 이후부터 감점
          let finalScore = 1000 + hpScore - timePenalty;
          if (finalScore < 0) finalScore = 0;

          // 비동기로 던져놓고 결과 통과
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

  // 적 행동(Intent) 일괄 실행 및 다음 행동 세팅
  executeEnemyTurns: () => {
    set((state) => {
      let currentShield = state.playerStatus.shield;
      let currentResist = state.playerStatus.resist;
      let hitInc = 0; // 이번 턴에 누적된 총 피격 횟수

      const newEnemies = state.enemies.map((enemy) => {
        if (enemy.currentHp <= 0) return enemy; // 이미 죽은 적은 스킵

        let currentHp = enemy.currentHp;
        let currentStatuses = { ...(enemy.statuses || {}) };

        // 🌟 1. 상태이상 주기적 데미지 처리 (턴 시작 시점)
        if (currentStatuses.BURN && currentStatuses.BURN > 0) {
          currentHp -= currentStatuses.BURN * 3; // 스택당 3 피해
        }
        if (currentStatuses.POISON && currentStatuses.POISON > 0) {
          currentHp -= currentStatuses.POISON; // 스택당 1 피해
        }

        if (currentHp <= 0) {
          // 상태이상 데미지로 사망
          return { ...enemy, currentHp: 0, statuses: {}, currentIntent: null };
        }

        let enemyObj = { ...enemy, currentHp };

        // 🌟 2. 행동 처리
        if (enemyObj.currentIntent) {
          if (enemyObj.currentIntent.type === 'ATTACK' && enemyObj.currentIntent.amount) {

            const isSpecial = enemyObj.currentIntent.damageType === 'SPECIAL';

            // 🌟 특수 및 다단 히트 기믹 처리
            let rawDamage = enemyObj.currentIntent.amount;
            let hitCount = 1;

            if (enemyObj.currentIntent.description.includes('5x3')) {
              rawDamage = 5;
              hitCount = 3;
            } else if (enemyObj.currentIntent.description.includes('4x2')) {
              rawDamage = 4;
              hitCount = 2;
            }

            // 🌟 WEAK(약화) 처리 (데미지 25% 감소)
            if (currentStatuses.WEAK && currentStatuses.WEAK > 0) {
              rawDamage = Math.floor(rawDamage * 0.75);
            }

            let totalDamageToPlayer = 0;

            // N 번 타격 연산
            for (let i = 0; i < hitCount; i++) {
              let damageToPlayer = rawDamage;

              if (isSpecial) {
                if (currentResist > 0) {
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

              // 각 타격마다 데미지가 1이라도 들어왔다면 피격 횟수(큐) 증가
              if (damageToPlayer > 0) {
                hitInc += 1;
              }
            }

            // 남은 데미지가 있다면 런 스토어의 전역 체력 차감
            if (totalDamageToPlayer > 0) {
              useRunStore.getState().damagePlayer(totalDamageToPlayer);
              console.log(`[피격] 플레이어가 총 ${totalDamageToPlayer} 상흔을 입었습니다.`);

              // 🌟 보스 패턴 기믹: 오염된 소이탄에 피격당해 데미지가 1이라도 들어왔다면 화상 카드 강제 삽입
              if (enemyObj.currentIntent.description.includes('소이탄')) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...burnBlueprint } = STATUS_CARDS[0]; // id를 떼버리고 던짐
                useDeckStore.getState().addCardToDiscardPile(burnBlueprint);
                useRunStore.getState().setToastMessage('🔥 오염물질 피격: 덱에 [화상] 카드가 섞여들어왔습니다!');
              }

            } else {
              console.log(`[피격 차단] 방어막으로 적군 데미지 차단 성공!`);
            }
          } else if (enemyObj.currentIntent.type === 'BUFF' && enemyObj.currentIntent.amount) {
            // 적군의 자체 버프 (예: 방어도 증가)
            enemyObj = {
              ...enemyObj,
              shield: enemyObj.shield + enemyObj.currentIntent.amount,
              visualEffect: { type: 'BUFF' as const, tick: Date.now() } // 🌟 버프 애니메이션 트리거
            };
          }
        }

        // 🌟 3. 행동 종료 후 상태이상 1스택씩 감소 및 다음 의도 부여
        const nextStatuses: Record<string, number> = {};
        Object.entries(currentStatuses).forEach(([key, val]) => {
          if (val > 1) nextStatuses[key] = val - 1;
        });

        return {
          ...enemyObj,
          statuses: nextStatuses,
          currentIntent: determineNextIntent(enemyObj.baseId),
          visualEffect: enemyObj.visualEffect?.type === 'BUFF' ? enemyObj.visualEffect : undefined // BUFF 효과는 유지, DAMAGE는 해제
        };
      });

      // 3. 패배 판정: 플레이어의 런 스토어 상 체력이 0 이하인가?
      const isDefeat = useRunStore.getState().playerHp <= 0;

      return {
        enemies: newEnemies,
        playerStatus: { ...state.playerStatus, shield: currentShield, resist: currentResist },
        battleResult: isDefeat ? 'DEFEAT' : 'NONE', // 임시: NONE 외 기존 유지 필요 시 분기 고려
        playerHitQueue: state.playerHitQueue + hitInc
      };
    });
  }
}));
