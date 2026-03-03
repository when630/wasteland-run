// src/types/gameTypes.ts

export enum CardType {
  PHYSICAL_ATTACK = 'PHYSICAL_ATTACK',
  SPECIAL_ATTACK = 'SPECIAL_ATTACK',
  PHYSICAL_DEFENSE = 'PHYSICAL_DEFENSE',
  SPECIAL_DEFENSE = 'SPECIAL_DEFENSE',
  UTILITY = 'UTILITY',
}

export interface CardEffect {
  type: 'DAMAGE' | 'SHIELD' | 'RESIST' | 'DRAW' | 'ADD_AMMO' | 'HEAL' | 'BUFF' | 'DEBUFF';
  amount?: number;
  // TODO: 버프/디버프 타입 및 지속시간 추후 확장
}

export interface Card {
  id: string;              // 고유 인스턴스 ID (같은 카드여도 덱 안에서 식별하기 위함)
  baseId: string;          // 카드 원본 ID (예: 'old_pipe')
  name: string;            // 카드명
  type: CardType;          // 카드 타입
  costAp: number;          // 필요 행동력
  costAmmo: number;        // 필요 탄약
  description: string;     // UI에 표시될 설명 텍스트
  effects: CardEffect[];   // 카드 사용 시 발동할 효과 배열
  isExhaust?: boolean;     // 소멸(Exhaust) 여부
  isUpgraded?: boolean;    // 강화(Upgrade) 여부
}
