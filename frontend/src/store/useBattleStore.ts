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
  hasPlayedUtilityThisTurn: boolean; // 🌟 아크 심장 유물 용: 이번 턴에 변화 카드를 사용했는지 추적
  playerVisualEffect?: { type: 'DAMAGE' | 'HEAL', tick: number }; // 🌟 플레이어 피격 연출용 상태

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
  executeEnemyTurns: () => void; // 적 AI 행동 실행 트리거
  setTargetingCard: (cardId: string | null) => void;
  setPlayedUtilityThisTurn: (value: boolean) => void; // 🌟 아크 심장 용 상태 업데이트
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
  hasPlayedUtilityThisTurn: false,

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
      hasPlayedUtilityThisTurn: false
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
        hasPlayedUtilityThisTurn: false, // 🌟 매 턴 시작 시 초기화
        playerVisualEffect: undefined
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
  setTargetingCard: (cardId: string | null) => set({ targetingCardId: cardId }),
  setPlayedUtilityThisTurn: (value: boolean) => set({ hasPlayedUtilityThisTurn: value }),

  /* --- 전투 액션 함수 --- */

  addPlayerShield: (amount: number) => set((state) => ({
    playerStatus: { ...state.playerStatus, shield: state.playerStatus.shield + amount }
  })),

  addPlayerResist: (amount: number) => set((state) => ({
    playerStatus: { ...state.playerStatus, resist: state.playerStatus.resist + amount }
  })),

  // 적에게 물리/특수 데미지 가함. 쉴드나 저항부터 까고 남은 수치만큼 체력 차감
  applyDamageToEnemy: (enemyId: string, amount: number, type: DamageType) => {
    set((state) => {
      const newEnemies = state.enemies.map(enemy => {
        if (enemy.id !== enemyId) return enemy;

        let remainingDamage = amount;
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

      // 2. Victory 판정: 남은 적들의 hp가 전부 0인가?
      const isVictory = newEnemies.every(e => e.currentHp <= 0);

      if (isVictory) {
        return { enemies: newEnemies, battleResult: 'VICTORY' };
      }

      return { enemies: newEnemies };
    });
  },

  // 적 행동(Intent) 일괄 실행 및 다음 행동 세팅
  executeEnemyTurns: () => {
    set((state) => {
      let currentShield = state.playerStatus.shield;
      let playerHitTick: number | undefined = undefined;

      const newEnemies = state.enemies.map((enemy) => {
        // 생존한 적군만 행동
        if (enemy.currentHp > 0 && enemy.currentIntent) {
          if (enemy.currentIntent.type === 'ATTACK' && enemy.currentIntent.amount) {

            // 🌟 브루터스 다단 히트 처리 ('광란의 후려치기 (5x3)' 등)
            let rawDamage = enemy.currentIntent.amount;
            let hitCount = 1;

            if (enemy.currentIntent.description.includes('5x3')) {
              rawDamage = 5;
              hitCount = 3;
            }

            let totalDamageToPlayer = 0;

            // N 번 타격 연산
            for (let i = 0; i < hitCount; i++) {
              let damageToPlayer = rawDamage;
              if (currentShield > 0) {
                if (currentShield >= damageToPlayer) {
                  currentShield -= damageToPlayer;
                  damageToPlayer = 0;
                } else {
                  damageToPlayer -= currentShield;
                  currentShield = 0;
                }
              }
              totalDamageToPlayer += damageToPlayer;
            }

            // 남은 데미지가 있다면 런 스토어의 전역 체력 차감
            if (totalDamageToPlayer > 0) {
              useRunStore.getState().damagePlayer(totalDamageToPlayer);
              playerHitTick = Date.now(); // 피격 이펙트 플래그 설정
              console.log(`[피격] 플레이어가 총 ${totalDamageToPlayer} 상흔을 입었습니다.`);

              // 🌟 보스 패턴 기믹: 오염된 소이탄에 피격당해 데미지가 1이라도 들어왔다면 화상 카드 강제 삽입
              if (enemy.currentIntent.description.includes('소이탄')) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...burnBlueprint } = STATUS_CARDS[0]; // id를 떼버리고 던짐
                useDeckStore.getState().addCardToDiscardPile(burnBlueprint);
                useRunStore.getState().setToastMessage('🔥 오염물질 피격: 덱에 [화상] 카드가 섞여들어왔습니다!');
              }

            } else {
              console.log(`[피격 차단] 방어막으로 적군 데미지 차단 성공!`);
            }
          } else if (enemy.currentIntent.type === 'BUFF' && enemy.currentIntent.amount) {
            // 적군의 자체 버프 (예: 방어도 증가)
            return {
              ...enemy,
              shield: enemy.shield + enemy.currentIntent.amount,
              currentIntent: determineNextIntent(enemy.baseId),
              visualEffect: { type: 'BUFF' as const, tick: Date.now() } // 🌟 버프 애니메이션 트리거
            };
          }
          // 행동 종료 후 다음 의도 부여
          return {
            ...enemy,
            currentIntent: determineNextIntent(enemy.baseId),
            visualEffect: undefined // 일반 턴 종료 시 이펙트 해제
          };
        }
        return enemy; // 죽거나 상태이상이면 스킵
      });

      // 3. 패배 판정: 플레이어의 런 스토어 상 체력이 0 이하인가?
      const isDefeat = useRunStore.getState().playerHp <= 0;

      return {
        enemies: newEnemies,
        playerStatus: { ...state.playerStatus, shield: currentShield },
        battleResult: isDefeat ? 'DEFEAT' : 'NONE', // 임시: NONE 외 기존 유지 필요 시 분기 고려
        playerVisualEffect: playerHitTick ? { type: 'DAMAGE', tick: playerHitTick } : state.playerVisualEffect
      };
    });
  }
}));
