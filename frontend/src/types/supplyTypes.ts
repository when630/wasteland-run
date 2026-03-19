export const SupplyTier = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
} as const;

export type SupplyTier = typeof SupplyTier[keyof typeof SupplyTier];

export const SupplyUsageContext = {
  COMBAT: 'COMBAT',
  BOTH: 'BOTH',
} as const;

export type SupplyUsageContext = typeof SupplyUsageContext[keyof typeof SupplyUsageContext];

export interface Supply {
  id: string;
  name: string;
  tier: SupplyTier;
  description: string;
  icon: string;
  image?: string;
  usageContext: SupplyUsageContext;
  shopPrice: { min: number; max: number };
}
