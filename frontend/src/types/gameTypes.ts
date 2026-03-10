// src/types/gameTypes.ts

export const CardType = {
  PHYSICAL_ATTACK: 'PHYSICAL_ATTACK',
  SPECIAL_ATTACK: 'SPECIAL_ATTACK',
  PHYSICAL_DEFENSE: 'PHYSICAL_DEFENSE',
  SPECIAL_DEFENSE: 'SPECIAL_DEFENSE',
  UTILITY: 'UTILITY',
  STATUS_BURN: 'STATUS_BURN',
  STATUS_RADIATION: 'STATUS_RADIATION',
} as const;

export type CardType = typeof CardType[keyof typeof CardType];

export const CardTier = {
  BASIC: 'BASIC',
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
} as const;

export type CardTier = typeof CardTier[keyof typeof CardTier];

export interface CardEffect {
  type: 'DAMAGE' | 'SHIELD' | 'RESIST' | 'DRAW' | 'ADD_AMMO' | 'HEAL' | 'BUFF' | 'DEBUFF';
  amount?: number;
  condition?: string; // e.g. 'NEXT_IS_ATTACK'
  target?: string;    // e.g. 'ALL_ENEMIES', 'PLAYER'
  statusType?: 'BURN' | 'POISON' | 'VULNERABLE' | 'WEAK' | string; // 버프/디버프 세부 타입
  duration?: number;  // 상태이상 지속 턴 수
}

export interface Card {
  id: string;              // 고유 인스턴스 ID (같은 카드여도 덱 안에서 식별하기 위함)
  baseId: string;          // 카드 원본 ID (예: 'old_pipe')
  name: string;            // 카드명
  type: CardType;          // 카드 타입
  tier?: CardTier;         // 획득 등급 추가
  costAp: number;          // 필요 행동력
  costAmmo: number;        // 필요 탄약
  description: string;     // UI에 표시될 설명 텍스트
  effects: CardEffect[];   // 카드 사용 시 발동할 효과 배열
  isExhaust?: boolean;     // 소멸(Exhaust) 여부
  isUpgraded?: boolean;    // 강화(Upgrade) 여부
}
