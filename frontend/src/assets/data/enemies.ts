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
    maxHp: 28,
  },
  waste_slime: {
    baseId: 'waste_slime',
    name: '폐기물 슬라임',
    maxHp: 65,
  },
  mutant_behemoth: {
    baseId: 'mutant_behemoth',
    name: '돌연변이 베히모스',
    maxHp: 110,
  },
  rogue_sentry: {
    baseId: 'rogue_sentry',
    name: '폭주하는 경비 드론',
    maxHp: 85,
  },
  brutus: {
    baseId: 'brutus',
    name: '고철 기갑수 브루터스',
    maxHp: 140,
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
        return { type: 'ATTACK', amount: 5, damageType: 'PHYSICAL', description: '⚔️ 투박한 타격 5' };
      } else {
        return { type: 'ATTACK', amount: 7, damageType: 'PHYSICAL', description: '⚔️ 강하게 후려치기 7' };
      }
    }
    case 'acid_dog': {
      // 70% 특수피해 4, 30% 특수피해 6
      if (rand < 0.7) {
        return { type: 'ATTACK', amount: 4, damageType: 'SPECIAL', description: '☣️ 산성 침 4' }; // 차후 디버프 부여로 발전 가능
      } else {
        return { type: 'ATTACK', amount: 6, damageType: 'PHYSICAL', description: '⚔️ 물어뜯기 6' };
      }
    }
    case 'waste_slime': {
      // 50% 확률로 자기방어(버프), 50% 확률로 물리공격 3
      if (rand < 0.5) {
        return { type: 'BUFF', amount: 5, description: '🛡️ 단단해지기 (방어도 5)' };
      } else {
        return { type: 'ATTACK', amount: 3, damageType: 'PHYSICAL', description: '⚔️ 짓누르기 3' };
      }
    }
    case 'mutant_behemoth': {
      // 40% 강타, 30% 쉴드, 30% 묵직한 내려찍기
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 15, damageType: 'PHYSICAL', description: '⚔️ 괴력의 강타 15' };
      } else if (rand < 0.7) {
        return { type: 'BUFF', amount: 15, description: '🛡️ 재생의 외침 (방어도 15)' };
      } else {
        return { type: 'ATTACK', amount: 12, damageType: 'PHYSICAL', description: '⚔️ 묵직한 내려찍기 12 (취약)', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }
    case 'rogue_sentry': {
      // 50% 레이저, 30% 조준(방어), 20% 연발 사격
      if (rand < 0.5) {
        return { type: 'ATTACK', amount: 8, damageType: 'SPECIAL', description: '☣️ 고출력 레이저 8' };
      } else if (rand < 0.8) {
        return { type: 'BUFF', amount: 8, description: '🛡️ 목표 재조준 (방어도 8)' };
      } else {
        return { type: 'ATTACK', amount: 8, damageType: 'PHYSICAL', description: '⚔️ 연발 권총 사격 (4x2)' }; // 🌟 데미지 amount는 실제 렌더링용, 작동은 AI 파싱부에서 4x2로 구현
      }
    }
    case 'brutus': {
      if (rand < 0.25) {
        // A패턴 (엔진 예열)
        return { type: 'BUFF', amount: 10, description: '🛡️ 엔진 예열 (방어도 10 회복, 괴력 획득)' };
      } else if (rand < 0.50) {
        // B패턴 (굴삭기 내려찍기)
        return { type: 'ATTACK', amount: 18, damageType: 'PHYSICAL', description: '⚔️ 굴삭기 내려찍기 18' };
      } else if (rand < 0.75) {
        // C패턴 (소이탄)
        return { type: 'ATTACK', amount: 14, damageType: 'SPECIAL', description: '☣️ 오염된 소이탄 14' };
      } else {
        // D패턴 (광란)
        return { type: 'ATTACK', amount: 18, damageType: 'PHYSICAL', description: '⚔️ 광란의 후려치기 (6x3)' };
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
