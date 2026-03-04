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
  },
  brutus: {
    baseId: 'brutus',
    name: '고철 기갑수 브루터스',
    maxHp: 120,
    // 보스는 시작할 때 20의 쉴드가 있어야 하는데, 이건 배틀 스토어 초기화나 여기서 패시브로 설계 가능
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
        return { type: 'ATTACK', amount: 5, description: '⚔️ 투박한 타격 5' };
      } else {
        return { type: 'ATTACK', amount: 7, description: '⚔️ 강하게 후려치기 7' };
      }
    }
    case 'acid_dog': {
      // 70% 특수피해 4, 30% 특수피해 6
      if (rand < 0.7) {
        return { type: 'ATTACK', amount: 4, description: '☣️ 산성 침 4' }; // 차후 디버프 부여로 발전 가능
      } else {
        return { type: 'ATTACK', amount: 6, description: '⚔️ 물어뜯기 6' };
      }
    }
    case 'waste_slime': {
      // 50% 확률로 자기방어(버프), 50% 확률로 물리공격 3
      if (rand < 0.5) {
        return { type: 'BUFF', amount: 5, description: '🛡️ 단단해지기 (방어도 5)' };
      } else {
        return { type: 'ATTACK', amount: 3, description: '⚔️ 짓누르기 3' };
      }
    }
    case 'brutus': {
      // 턴 진행에 맞는 로테이션을 정확히 짤 수 있도록 rand 대신 state를 의존해야 하나,
      // determineNextIntent 함수가 stateless 하므로 보스는 임시로 턴마다 무작위가 아닌 균등 분포 로테이션을 따르게 하거나
      // 호출 시 턴수를 인자로 받게 확장해야 합니다.
      // 일단 간단한 구현을 위해 무작위 패턴 4종을 부여하거나, 난수 구간을 잘라 모방합니다.
      // (완벽한 로테이션 A->B->C->D 구현을 위해선 useBattleStore에 패턴 카운터가 필요합니다)

      if (rand < 0.25) {
        // A패턴 (엔진 예열)
        return { type: 'BUFF', amount: 10, description: '🛡️ 엔진 예열 (방어도 10 회복, 괴력 획득)' };
      } else if (rand < 0.50) {
        // B패턴 (굴삭기 내려찍기)
        return { type: 'ATTACK', amount: 16, description: '⚔️ 굴삭기 내려찍기 16' };
      } else if (rand < 0.75) {
        // C패턴 (소이탄)
        // 특수 공격 대신 이펙트만 구분하고, 실제 전투 스토어에서 이 설명이나 amount를 보고 화상 카드를 넣도록 합니다.
        return { type: 'ATTACK', amount: 12, description: '☣️ 오염된 소이탄 12' };
      } else {
        // D패턴 (광란)
        return { type: 'ATTACK', amount: 15, description: '⚔️ 광란의 후려치기 (5x3)' };
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
    shield: baseId === 'brutus' ? 20 : 0, // 브루터스 패시브: 전투 시작 시 20 쉴드
    resist: 0,
    currentIntent: determineNextIntent(baseId) // 초기 랜덤 의도 부여
  };
};
