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

  // 보급품 턴 효과
  supplyAttackBonusTurn: number;      // 전투 흥분제/광전사 혈청: 이번 턴 공격 보너스
  supplyFirstSpecialBonus: number;    // 전술 탄약 벨트: 이번 턴 첫 특수공격 보너스
  supplyDmgReductionFlat: number;     // 진통제: 이번 턴 피해 고정 감소
  supplyDmgReductionPercent: number;  // 나노 필드: 피해 % 감소
  supplyDmgReductionPercentTurns: number;
  supplyRegenPerTurn: number;         // 수혈 팩: 턴 시작 시 회복
  supplyRegenTurns: number;
  supplyBerserkerSelfDmg: number;     // 광전사 혈청: 턴 종료 시 자해
  supplyExtraTurn: boolean;           // 시간 왜곡기: 추가 턴
  supplyTempMaxHp: number;            // 생체 강화: 전투 중 임시 최대 HP

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

  // 보급품 효과 세터
  applySupplyTurnEffects: (effects: {
    attackBonusTurn?: number;
    firstSpecialBonus?: number;
    dmgReductionFlat?: number;
    dmgReductionPercent?: number;
    dmgReductionPercentTurns?: number;
    regenPerTurn?: number;
    regenTurns?: number;
    berserkerSelfDmg?: number;
    extraTurn?: boolean;
    tempMaxHp?: number;
  }) => void;
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
