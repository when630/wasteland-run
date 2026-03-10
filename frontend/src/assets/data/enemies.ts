import type { Enemy, Intent, EnemyTier } from '../../types/enemyTypes';
import { generateUniqueId } from '../../utils/rng';

export const BASE_ENEMIES: Record<string, Omit<Enemy, 'id' | 'currentHp' | 'shield' | 'resist' | 'currentIntent'>> = {
  // 일반 몬스터
  scrap_collector: {
    baseId: 'scrap_collector',
    tier: 'NORMAL',
    name: '고철 수집가',
    maxHp: 45,
  },
  acid_dog: {
    baseId: 'acid_dog',
    tier: 'NORMAL',
    name: '산성 침 들개',
    maxHp: 28,
  },
  waste_slime: {
    baseId: 'waste_slime',
    tier: 'NORMAL',
    name: '폐기물 슬라임',
    maxHp: 65,
  },
  radiation_spider: {
    baseId: 'radiation_spider',
    tier: 'NORMAL',
    name: '방사능 거미',
    maxHp: 22,
  },
  rust_marauder: {
    baseId: 'rust_marauder',
    tier: 'NORMAL',
    name: '녹슨 약탈자',
    maxHp: 38,
  },
  scrap_turret: {
    baseId: 'scrap_turret',
    tier: 'NORMAL',
    name: '폐 자동포탑',
    maxHp: 30,
  },
  // 엘리트 몬스터
  mutant_behemoth: {
    baseId: 'mutant_behemoth',
    tier: 'ELITE',
    name: '돌연변이 베히모스',
    maxHp: 110,
  },
  rogue_sentry: {
    baseId: 'rogue_sentry',
    tier: 'ELITE',
    name: '폭주하는 경비 드론',
    maxHp: 85,
  },
  mutant_sniper: {
    baseId: 'mutant_sniper',
    tier: 'ELITE',
    name: '변이 저격수',
    maxHp: 75,
  },
  // 보스
  brutus: {
    baseId: 'brutus',
    tier: 'BOSS',
    name: '고철 기갑수 브루터스',
    maxHp: 140,
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
    case 'radiation_spider': {
      // 빠른 독 공격 위주, 체력 낮음
      if (rand < 0.5) {
        return { type: 'ATTACK', amount: 4, damageType: 'SPECIAL', description: '☣️ 독 침 4' };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 5, damageType: 'PHYSICAL', description: '⚔️ 물어뜯기 5' };
      } else {
        return { type: 'ATTACK', amount: 3, damageType: 'SPECIAL', description: '☣️ 맹독 주입 3', applyDebuff: { status: 'WEAK', amount: 1 } };
      }
    }
    case 'rust_marauder': {
      // 물리 공격 위주, 다단 히트 가능
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 8, damageType: 'PHYSICAL', description: '⚔️ 녹슨 도끼 내려치기 8' };
      } else if (rand < 0.7) {
        return { type: 'ATTACK', amount: 9, damageType: 'PHYSICAL', description: '⚔️ 연속 베기 (3x3)' };
      } else {
        return { type: 'BUFF', amount: 6, description: '🛡️ 폐차 문 방어 (방어도 6)' };
      }
    }
    case 'scrap_turret': {
      // 특수 공격 위주, 원거리
      if (rand < 0.5) {
        return { type: 'ATTACK', amount: 6, damageType: 'SPECIAL', description: '☣️ 자동 사격 6' };
      } else if (rand < 0.8) {
        return { type: 'BUFF', amount: 4, description: '🛡️ 재장전 (방어도 4)' };
      } else {
        return { type: 'ATTACK', amount: 6, damageType: 'SPECIAL', description: '☣️ 연사 (3x2)' };
      }
    }
    case 'mutant_sniper': {
      // 고데미지 저격 + 은폐 + 독탄
      if (rand < 0.35) {
        return { type: 'ATTACK', amount: 20, damageType: 'SPECIAL', description: '☣️ 정밀 저격 20' };
      } else if (rand < 0.6) {
        return { type: 'ATTACK', amount: 8, damageType: 'PHYSICAL', description: '⚔️ 근접 나이프 8', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else if (rand < 0.85) {
        return { type: 'BUFF', amount: 12, description: '🛡️ 은폐 (방어도 12)' };
      } else {
        return { type: 'ATTACK', amount: 12, damageType: 'SPECIAL', description: '☣️ 독탄 12', applyDebuff: { status: 'WEAK', amount: 1 } };
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
    shield: baseDef.tier === 'BOSS' ? 20 : 0, // 보스 패시브: 전투 시작 시 20 쉴드
    resist: 0,
    currentIntent: determineNextIntent(baseId) // 초기 랜덤 의도 부여
  };
};

/**
 * 특정 등급의 적 baseId 목록을 반환
 */
export const getEnemyIdsByTier = (tier: EnemyTier): string[] =>
  Object.values(BASE_ENEMIES).filter(e => e.tier === tier).map(e => e.baseId);
