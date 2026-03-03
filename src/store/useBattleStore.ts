import { create } from 'zustand';
import type { Enemy } from '../types/enemyTypes';
import { useRunStore } from './useRunStore';
import { determineNextIntent } from '../assets/data/enemies';

type TurnState = 'PLAYER' | 'ENEMY' | 'RESOLVE';

// 이펙트 판정 용 타입
export type DamageType = 'PHYSICAL' | 'SPECIAL' | 'PIERCING';

interface PlayerBattleStatus {
  shield: number; // 물리 방어 버프
  resist: number; // 특수 방어 버프
}

interface BattleState {
  currentTurn: TurnState;
  turnCount: number;
  playerActionPoints: number;
  playerAmmo: number;
  playerStatus: PlayerBattleStatus;
  enemies: Enemy[];

  // Actions
  startPlayerTurn: () => void;
  endPlayerTurn: () => void;
  useAp: (amount: number) => boolean;
  addAmmo: (amount: number) => void;
  spawnEnemies: (enemyArray: Enemy[]) => void;

  // Combat Actions
  addPlayerShield: (amount: number) => void;
  addPlayerResist: (amount: number) => void;
  applyDamageToEnemy: (enemyId: string, amount: number, type: DamageType) => void;
  executeEnemyTurns: () => void; // 적 AI 행동 실행 트리거
}

export const useBattleStore = create<BattleState>((set, get) => ({
  currentTurn: 'PLAYER',
  turnCount: 1,
  playerActionPoints: 3,
  playerAmmo: 0,
  playerStatus: { shield: 0, resist: 0 },
  enemies: [],

  startPlayerTurn: () => set((state) => ({
    currentTurn: 'PLAYER',
    playerActionPoints: 3,
    turnCount: state.turnCount + 1,
    // 턴 시작 시 이전 턴에 쌓아둔 방어/저항력 수치를 초기화 (일회성 휘발)
    playerStatus: { shield: 0, resist: 0 }
  })),

  endPlayerTurn: () => set({ currentTurn: 'ENEMY' }),

  useAp: (amount: number) => {
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

        return {
          ...enemy,
          shield: newShield,
          resist: newResist,
          currentHp: newHp,
        };
      });

      return { enemies: newEnemies };
    });
  },

  // 적 행동(Intent) 일괄 실행 및 다음 행동 세팅
  executeEnemyTurns: () => {
    set((state) => {
      let currentShield = state.playerStatus.shield;

      const newEnemies = state.enemies.map((enemy) => {
        // 생존한 적군만 행동
        if (enemy.currentHp > 0 && enemy.currentIntent) {
          if (enemy.currentIntent.type === 'ATTACK' && enemy.currentIntent.amount) {
            // 방어 로직 연산: 플레이어의 현재 남은 Shield부터 깎음
            let damageToPlayer = enemy.currentIntent.amount;

            if (currentShield > 0) {
              if (currentShield >= damageToPlayer) {
                currentShield -= damageToPlayer;
                damageToPlayer = 0;
              } else {
                damageToPlayer -= currentShield;
                currentShield = 0;
              }
            }

            // 남은 데미지가 있다면 런 스토어의 전역 체력 차감
            if (damageToPlayer > 0) {
              useRunStore.getState().damagePlayer(damageToPlayer);
              console.log(`[피격] 플레이어가 ${damageToPlayer} 물리 피해를 입었습니다.`);
            } else {
              console.log(`[피격 차단] 방어막으로 적군 데미지 차단 성공!`);
            }
          }
          // 행동 종료 후 다음 의도 부여
          return {
            ...enemy,
            currentIntent: determineNextIntent(enemy.baseId)
          };
        }
        return enemy; // 죽거나 상태이상이면 스킵
      });

      return {
        enemies: newEnemies,
        playerStatus: { ...state.playerStatus, shield: currentShield }
      };
    });
  }
}));
