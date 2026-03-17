import type { Enemy, DamageType } from '../../types/enemyTypes';

export type { DamageType };

export type TurnState = 'PLAYER' | 'ENEMY' | 'RESOLVE';
export type BattleResult = 'NONE' | 'VICTORY' | 'DEFEAT';

export interface PlayerBattleStatus {
  shield: number;
  resist: number;
  nextPhysicalFree: boolean;
  cannotPlayPhysicalAttack: boolean;
  retainCardCount: number;
  reflectPhysical: number;
  apOnSpecialDefend: number;
  ammoOnSpecialDefend: number;
  markOfFate: { enemyId: string; healAmount: number; ammoAmount: number; drawAmount?: number } | null;
  physicalAttacksThisTurn: number;
}

export const DEFAULT_PLAYER_STATUS: PlayerBattleStatus = {
  shield: 0, resist: 0,
  nextPhysicalFree: false,
  cannotPlayPhysicalAttack: false,
  retainCardCount: 0,
  reflectPhysical: 0,
  apOnSpecialDefend: 0,
  ammoOnSpecialDefend: 0,
  markOfFate: null,
  physicalAttacksThisTurn: 0,
};

export type PlayerSpriteState = 'IDLE' | 'PHYSICAL_ATTACK' | 'SPECIAL_ATTACK' | 'PHYSICAL_HIT' | 'SPECIAL_HIT';

export interface PlayerSlice {
  playerActionPoints: number;
  playerMaxAp: number;
  playerAmmo: number;
  playerStatus: PlayerBattleStatus;
  playerDebuffs: Record<string, number>;
  playerHitQueue: Array<{ type: 'DAMAGE' | 'BURN' | 'POISON' }>;
  playerSpriteState: PlayerSpriteState;
  hasPlayedUtilityThisTurn: boolean;
  powerDefenseAmmo50: boolean;
  powerPhysicalScalingActive: boolean;
  powerPhysicalScalingBonus: number;
  bonusApNextTurn: number;
  // 신규 파워
  powerFortifyAmount: number;         // 요새화: 매 턴 시작 시 방어도
  powerRageAmount: number;            // 분노: 물리 피격 시 방어도
  powerFrenzyAmount: number;          // 광기: HP 50% 이하 시 공격 보너스
  powerPhoenixAmount: number;         // 불사조: 소멸 시 방어도
  nextAttackBonus: number;            // 무기 개조: 다음 공격 피해 보너스
  rampageCounts: Record<string, number>; // 폭주: baseId별 사용 횟수

  consumeAp: (amount: number) => boolean;
  addAmmo: (amount: number) => void;
  addPlayerShield: (amount: number) => void;
  addPlayerResist: (amount: number) => void;
  consumePlayerHitQueue: () => void;
  setPlayerSpriteState: (state: PlayerSpriteState) => void;
  setPlayerStatusField: (field: Partial<PlayerBattleStatus>) => void;
  setMarkOfFate: (enemyId: string, healAmount: number, ammoAmount: number, drawAmount?: number) => void;
  setPowerDefenseAmmo50: (active: boolean) => void;
  setPowerPhysicalScaling: (active: boolean) => void;
  addPhysicalScalingBonus: (amount: number) => void;
  setPlayedUtilityThisTurn: (value: boolean) => void;
  // 신규 파워 세터
  setPowerFortify: (amount: number) => void;
  setPowerRage: (amount: number) => void;
  setPowerFrenzy: (amount: number) => void;
  setPowerPhoenix: (amount: number) => void;
  setNextAttackBonus: (amount: number) => void;
  addRampageCount: (baseId: string) => void;
}

export interface EnemySlice {
  enemies: Enemy[];
  activeEnemyIndex: number | null;

  spawnEnemies: (enemyArray: Enemy[]) => void;
  applyStatusToEnemy: (enemyId: string, status: string, amount: number) => void;
  applyDamageToEnemy: (enemyId: string, amount: number, type: DamageType) => void;
  executeOneEnemyTurn: (enemyIndex: number) => void;
  setActiveEnemyIndex: (index: number | null) => void;
}

export interface DamageNumberEntry {
  id: number;
  enemyId: string;
  amount: number;
  color: number;
  timestamp: number;
  delay: number;
}

export interface BattleFlowSlice {
  currentTurn: TurnState;
  battleResult: BattleResult;
  turnCount: number;
  targetingCardId: string | null;
  targetingPosition: { x: number; y: number } | null;
  dragPreviewCardId: string | null;
  previewTargetEnemyId: string | null;
  damageNumbers: DamageNumberEntry[];

  startPlayerTurn: () => void;
  endPlayerTurn: () => void;
  resetBattle: () => void;
  setTargetingCard: (cardId: string | null) => void;
  setTargetingPosition: (pos: { x: number; y: number } | null) => void;
  setDragPreviewCard: (cardId: string | null) => void;
  setPreviewTargetEnemy: (enemyId: string | null) => void;
  pushDamageNumber: (enemyId: string, amount: number, color: number) => void;
  clearExpiredDamageNumbers: () => void;
}

export type BattleState = PlayerSlice & EnemySlice & BattleFlowSlice;
