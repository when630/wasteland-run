import type { Enemy, Intent } from '../../types/enemyTypes';
import { generateUniqueId } from '../../utils/rng';

export const BASE_ENEMIES: Record<string, Omit<Enemy, 'id' | 'currentHp' | 'shield' | 'resist' | 'currentIntent'>> = {
  scrap_collector: {
    baseId: 'scrap_collector',
    name: '고철 수집가',
    maxHp: 45,
  },
  // TODO: 추후 녹슨 자동인형, 돌연변이 들개 등 추가
};

/**
 * 몬스터의 baseId에 따라 다음 턴 행동(Intent)을 결정하여 반환하는 함수
 */
export const determineNextIntent = (baseId: string): Intent => {
  const rand = Math.random();

  switch (baseId) {
    case 'scrap_collector': {
      // 60% 확률로 5 피해, 40% 확률로 7 피해
      if (rand < 0.6) {
        return { type: 'ATTACK', amount: 5, description: '투박한 타격 5' };
      } else {
        return { type: 'ATTACK', amount: 7, description: '강하게 후려치기 7' };
      }
    }
    default:
      return { type: 'UNKNOWN', description: '???' };
  }
};

/**
 * 특정 baseId의 적을 생성하여 새 인스턴스화 하는 공용 함수
 */
export const createEnemy = (baseId: string): Enemy => {
  const baseDef = BASE_ENEMIES[baseId];
  if (!baseDef) throw new Error(`Enemy ${baseId} not found`);

  return {
    ...baseDef,
    id: generateUniqueId(),
    currentHp: baseDef.maxHp,
    shield: 0,
    resist: 0,
    currentIntent: determineNextIntent(baseId) // 초기 랜덤 의도 부여
  };
};
