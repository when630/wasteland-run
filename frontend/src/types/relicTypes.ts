export const RelicTier = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  BOSS: 'BOSS',
} as const;

export type RelicTier = typeof RelicTier[keyof typeof RelicTier];

export interface Relic {
  id: string;          // 유물 고유 ID
  name: string;        // 유물 이름
  tier: RelicTier;     // 등급
  description: string; // 유물 효과 설명
  icon?: string;       // (Legacy) 아이콘 (이모지 또는 이미지 경로)
  image: string;       // 유물 이미지 경로
}
