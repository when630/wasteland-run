import type { Enemy, Intent } from '../../types/enemyTypes';
import { generateUniqueId } from '../../utils/rng';

export const BASE_ENEMIES: Record<string, Omit<Enemy, 'id' | 'currentHp' | 'shield' | 'resist' | 'currentIntent'>> = {
  scrap_collector: {
    baseId: 'scrap_collector',
    name: '고철 수집가',
    maxHp: 45,
  },
  acid_dog: {
    baseId: 'acid_dog',
    name: '산성 침 들개',
    maxHp: 25,
  },
  waste_slime: {
    baseId: 'waste_slime',
    name: '폐기물 슬라임',
    maxHp: 60,
  }
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
    case 'acid_dog': {
      // 70% 특수피해 4, 30% 특수피해 6
      if (rand < 0.7) {
        return { type: 'ATTACK', amount: 4, description: '산성 침 4' }; // 차후 디버프 부여로 발전 가능
      } else {
        return { type: 'ATTACK', amount: 6, description: '물어뜯기 6' };
      }
    }
    case 'waste_slime': {
      // 50% 확률로 자기방어(버프), 50% 확률로 물리공격 3
      if (rand < 0.5) {
        return { type: 'BUFF', amount: 5, description: '단단해지기 (방어도 5)' };
      } else {
        return { type: 'ATTACK', amount: 3, description: '짓누르기 3' };
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
