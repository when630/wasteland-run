export const RelicTier = {
  STARTER: 'STARTER',
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  BOSS: 'BOSS',
  EVENT: 'EVENT',
  SHOP: 'SHOP',
} as const;

export type RelicTier = typeof RelicTier[keyof typeof RelicTier];

export interface Relic {
  id: string;          // 유물 고유 ID
  name: string;        // 유물 이름
  tier: RelicTier;     // 등급
  description: string; // 유물 효과 설명
  icon?: string;       // 이모지 아이콘 (이미지 없을 때 대체)
  image?: string;      // 유물 이미지 경로 (없으면 icon 사용)
}
