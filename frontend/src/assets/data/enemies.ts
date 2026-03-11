import type { Enemy, Intent, EnemyTier } from '../../types/enemyTypes';
import { generateUniqueId, type SeededRNG } from '../../utils/rng';

type BaseEnemy = Omit<Enemy, 'id' | 'currentHp' | 'shield' | 'resist' | 'currentIntent'> & { chapter?: number; initialShield?: number };

export const BASE_ENEMIES: Record<string, BaseEnemy> = {
  // ===== 디버그: 훈련용 허수아비 =====
  training_dummy: {
    baseId: 'training_dummy',
    tier: 'NORMAL',
    name: '훈련용 허수아비',
    maxHp: 9999,
    chapter: 0,
  },

  // ===== 챕터 1: 오염된 외곽 도시 =====
  scrap_collector: {
    baseId: 'scrap_collector',
    tier: 'NORMAL',
    name: '고철 수집가',
    maxHp: 45,
    chapter: 1,
  },
  acid_dog: {
    baseId: 'acid_dog',
    tier: 'NORMAL',
    name: '산성 침 들개',
    maxHp: 28,
    chapter: 1,
  },
  waste_slime: {
    baseId: 'waste_slime',
    tier: 'NORMAL',
    name: '폐기물 슬라임',
    maxHp: 65,
    chapter: 1,
  },
  radiation_spider: {
    baseId: 'radiation_spider',
    tier: 'NORMAL',
    name: '방사능 거미',
    maxHp: 22,
    chapter: 1,
  },
  rust_marauder: {
    baseId: 'rust_marauder',
    tier: 'NORMAL',
    name: '녹슨 약탈자',
    maxHp: 38,
    chapter: 1,
  },
  scrap_turret: {
    baseId: 'scrap_turret',
    tier: 'NORMAL',
    name: '폐 자동포탑',
    maxHp: 30,
    chapter: 1,
  },
  // 엘리트 몬스터
  mutant_behemoth: {
    baseId: 'mutant_behemoth',
    tier: 'ELITE',
    name: '돌연변이 베히모스',
    maxHp: 110,
    chapter: 1,
  },
  rogue_sentry: {
    baseId: 'rogue_sentry',
    tier: 'ELITE',
    name: '폭주하는 경비 드론',
    maxHp: 85,
    chapter: 1,
  },
  mutant_sniper: {
    baseId: 'mutant_sniper',
    tier: 'ELITE',
    name: '변이 저격수',
    maxHp: 75,
    chapter: 1,
  },
  // 보스
  brutus: {
    baseId: 'brutus',
    tier: 'BOSS',
    name: '고철 기갑수 브루터스',
    maxHp: 140,
    chapter: 1,
  },

  // ===== 챕터 2: 무너진 지하철도 =====
  subway_rat: {
    baseId: 'subway_rat',
    tier: 'NORMAL',
    name: '지하철 쥐떼',
    maxHp: 32,
    chapter: 2,
  },
  rail_crawler: {
    baseId: 'rail_crawler',
    tier: 'NORMAL',
    name: '레일 크롤러',
    maxHp: 50,
    chapter: 2,
  },
  mole_person: {
    baseId: 'mole_person',
    tier: 'NORMAL',
    name: '두더지 인간',
    maxHp: 35,
    chapter: 2,
  },
  tunnel_spider: {
    baseId: 'tunnel_spider',
    tier: 'NORMAL',
    name: '터널 거미',
    maxHp: 26,
    chapter: 2,
  },
  electric_slime: {
    baseId: 'electric_slime',
    tier: 'NORMAL',
    name: '전기 슬라임',
    maxHp: 55,
    chapter: 2,
  },
  rusted_golem: {
    baseId: 'rusted_golem',
    tier: 'NORMAL',
    name: '녹슨 골렘',
    maxHp: 48,
    chapter: 2,
  },
  // 챕터 2 엘리트
  derailed_conductor: {
    baseId: 'derailed_conductor',
    tier: 'ELITE',
    name: '탈선한 차장',
    maxHp: 100,
    chapter: 2,
  },
  shadow_lurker: {
    baseId: 'shadow_lurker',
    tier: 'ELITE',
    name: '그림자 잠복자',
    maxHp: 90,
    chapter: 2,
  },
  track_guardian: {
    baseId: 'track_guardian',
    tier: 'ELITE',
    name: '궤도 수호자',
    maxHp: 95,
    chapter: 2,
  },
  // 챕터 2 보스
  leviathan_worm: {
    baseId: 'leviathan_worm',
    tier: 'BOSS',
    name: '심연의 대지렁이 레비아탄',
    maxHp: 180,
    chapter: 2,
    initialShield: 25,
  },

  // ===== 챕터 3: 거대 기업의 방주 =====
  security_drone: {
    baseId: 'security_drone',
    tier: 'NORMAL',
    name: '기업 경비 드론',
    maxHp: 40,
    chapter: 3,
  },
  bio_experiment: {
    baseId: 'bio_experiment',
    tier: 'NORMAL',
    name: '생체 실험체',
    maxHp: 55,
    chapter: 3,
  },
  corporate_guard: {
    baseId: 'corporate_guard',
    tier: 'NORMAL',
    name: '기업 경비원',
    maxHp: 42,
    chapter: 3,
  },
  nano_swarm: {
    baseId: 'nano_swarm',
    tier: 'NORMAL',
    name: '나노 군집',
    maxHp: 30,
    chapter: 3,
  },
  cryo_sentinel: {
    baseId: 'cryo_sentinel',
    tier: 'NORMAL',
    name: '냉동 감시자',
    maxHp: 50,
    chapter: 3,
  },
  hazmat_worker: {
    baseId: 'hazmat_worker',
    tier: 'NORMAL',
    name: '방호복 작업자',
    maxHp: 38,
    chapter: 3,
  },
  // 챕터 3 엘리트
  chief_scientist: {
    baseId: 'chief_scientist',
    tier: 'ELITE',
    name: '수석 과학자',
    maxHp: 110,
    chapter: 3,
  },
  war_machine: {
    baseId: 'war_machine',
    tier: 'ELITE',
    name: '전쟁 기계',
    maxHp: 120,
    chapter: 3,
  },
  // 챕터 3 최종 보스
  director_omega: {
    baseId: 'director_omega',
    tier: 'BOSS',
    name: '최종 지시자 오메가',
    maxHp: 220,
    chapter: 3,
    initialShield: 30,
  },
};

/**
 * 몬스터의 baseId에 따라 다음 턴 행동(Intent)을 결정하여 반환하는 함수
 */
export const determineNextIntent = (baseId: string, rng?: SeededRNG): Intent => {
  const rand = rng ? rng.next() : Math.random();

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

    // ===== 챕터 2: 무너진 지하철도 =====
    case 'subway_rat': {
      // 빠른 다수 공격, 체력 낮음
      if (rand < 0.5) {
        return { type: 'ATTACK', amount: 3, damageType: 'PHYSICAL', description: '⚔️ 물어뜯기 (2x3)' };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 5, damageType: 'PHYSICAL', description: '⚔️ 돌진 5' };
      } else {
        return { type: 'ATTACK', amount: 4, damageType: 'SPECIAL', description: '☣️ 감염된 이빨 4', applyDebuff: { status: 'WEAK', amount: 1 } };
      }
    }
    case 'rail_crawler': {
      // 무거운 물리 공격 + 방어
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 8, damageType: 'PHYSICAL', description: '⚔️ 레일 분쇄 8' };
      } else if (rand < 0.7) {
        return { type: 'BUFF', amount: 8, description: '🛡️ 강철 외피 (방어도 8)' };
      } else {
        return { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '⚔️ 열차 돌진 10' };
      }
    }
    case 'mole_person': {
      // 기습 + 디버프
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 7, damageType: 'PHYSICAL', description: '⚔️ 곡괭이 찌르기 7' };
      } else if (rand < 0.7) {
        return { type: 'ATTACK', amount: 5, damageType: 'PHYSICAL', description: '⚔️ 기습 5', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else {
        return { type: 'BUFF', amount: 6, description: '🛡️ 땅굴 숨기 (방어도 6)' };
      }
    }
    case 'tunnel_spider': {
      // 독 + 빠른 공격
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 5, damageType: 'SPECIAL', description: '☣️ 독거미 송곳니 5' };
      } else if (rand < 0.7) {
        return { type: 'ATTACK', amount: 3, damageType: 'SPECIAL', description: '☣️ 맹독 주사 3', applyDebuff: { status: 'WEAK', amount: 1 } };
      } else {
        return { type: 'ATTACK', amount: 6, damageType: 'PHYSICAL', description: '⚔️ 거미줄 포박 6', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }
    case 'electric_slime': {
      // 특수 공격 + 자기 방어
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 7, damageType: 'SPECIAL', description: '☣️ 전기 방전 7' };
      } else if (rand < 0.7) {
        return { type: 'BUFF', amount: 7, description: '🛡️ 전기 장벽 (방어도 7)' };
      } else {
        return { type: 'ATTACK', amount: 5, damageType: 'SPECIAL', description: '☣️ 연쇄 번개 (3x5)' };
      }
    }
    case 'rusted_golem': {
      // 느린 고데미지 + 방어 특화
      if (rand < 0.35) {
        return { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '⚔️ 철주먹 강타 10' };
      } else if (rand < 0.65) {
        return { type: 'BUFF', amount: 10, description: '🛡️ 녹슨 방벽 (방어도 10)' };
      } else {
        return { type: 'ATTACK', amount: 7, damageType: 'PHYSICAL', description: '⚔️ 지면 강타 7', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }
    case 'derailed_conductor': {
      // 엘리트: 다양한 패턴 전환
      if (rand < 0.3) {
        return { type: 'ATTACK', amount: 14, damageType: 'PHYSICAL', description: '⚔️ 차장의 철퇴 14' };
      } else if (rand < 0.5) {
        return { type: 'ATTACK', amount: 10, damageType: 'SPECIAL', description: '☣️ 열차 경적 충격파 10', applyDebuff: { status: 'WEAK', amount: 1 } };
      } else if (rand < 0.75) {
        return { type: 'BUFF', amount: 12, description: '🛡️ 열차 잔해 방패 (방어도 12)' };
      } else {
        return { type: 'ATTACK', amount: 8, damageType: 'PHYSICAL', description: '⚔️ 난타 (4x2)' };
      }
    }
    case 'shadow_lurker': {
      // 엘리트: 고데미지 기습 + 은폐
      if (rand < 0.35) {
        return { type: 'ATTACK', amount: 18, damageType: 'PHYSICAL', description: '⚔️ 기습 일격 18' };
      } else if (rand < 0.6) {
        return { type: 'BUFF', amount: 14, description: '🛡️ 그림자 은신 (방어도 14)' };
      } else if (rand < 0.85) {
        return { type: 'ATTACK', amount: 10, damageType: 'SPECIAL', description: '☣️ 암흑 투사 10', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else {
        return { type: 'ATTACK', amount: 6, damageType: 'PHYSICAL', description: '⚔️ 연속 자상 (3x2)' };
      }
    }
    case 'track_guardian': {
      // 엘리트: 방어 + 반격 특화
      if (rand < 0.3) {
        return { type: 'BUFF', amount: 16, description: '🛡️ 궤도 방벽 (방어도 16)' };
      } else if (rand < 0.55) {
        return { type: 'ATTACK', amount: 12, damageType: 'PHYSICAL', description: '⚔️ 궤도 파쇄기 12' };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 8, damageType: 'SPECIAL', description: '☣️ 전자기 펄스 8', applyDebuff: { status: 'WEAK', amount: 1 } };
      } else {
        return { type: 'ATTACK', amount: 15, damageType: 'PHYSICAL', description: '⚔️ 열차 충돌 15', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }
    case 'leviathan_worm': {
      // 보스: 4패턴 순환
      if (rand < 0.25) {
        return { type: 'BUFF', amount: 15, description: '🛡️ 갑각 재생 (방어도 15)' };
      } else if (rand < 0.50) {
        return { type: 'ATTACK', amount: 20, damageType: 'PHYSICAL', description: '⚔️ 대지렁이 돌진 20' };
      } else if (rand < 0.75) {
        return { type: 'ATTACK', amount: 16, damageType: 'SPECIAL', description: '☣️ 부식액 분사 16', applyDebuff: { status: 'WEAK', amount: 1 } };
      } else {
        return { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '⚔️ 지진 (5x2)', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }

    // ===== 챕터 3: 거대 기업의 방주 =====
    case 'security_drone': {
      // 특수 공격 위주 + 조준
      if (rand < 0.45) {
        return { type: 'ATTACK', amount: 7, damageType: 'SPECIAL', description: '☣️ 레이저 조사 7' };
      } else if (rand < 0.75) {
        return { type: 'ATTACK', amount: 5, damageType: 'SPECIAL', description: '☣️ 연사 (3x5)' };
      } else {
        return { type: 'BUFF', amount: 5, description: '🛡️ 전자 장벽 (방어도 5)' };
      }
    }
    case 'bio_experiment': {
      // 독 + 화상 복합
      if (rand < 0.35) {
        return { type: 'ATTACK', amount: 6, damageType: 'SPECIAL', description: '☣️ 산성 체액 6', applyDebuff: { status: 'BURN', amount: 1 } };
      } else if (rand < 0.65) {
        return { type: 'ATTACK', amount: 8, damageType: 'PHYSICAL', description: '⚔️ 변이 팔 휘두르기 8' };
      } else {
        return { type: 'BUFF', amount: 8, description: '🛡️ 세포 재생 (방어도 8)' };
      }
    }
    case 'corporate_guard': {
      // 물리 + 방어 균형
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 9, damageType: 'PHYSICAL', description: '⚔️ 진압 곤봉 9' };
      } else if (rand < 0.7) {
        return { type: 'BUFF', amount: 7, description: '🛡️ 방탄 조끼 (방어도 7)' };
      } else {
        return { type: 'ATTACK', amount: 6, damageType: 'PHYSICAL', description: '⚔️ 테이저건 6', applyDebuff: { status: 'WEAK', amount: 1 } };
      }
    }
    case 'nano_swarm': {
      // 다단히트 + 디버프, 체력 낮음
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 2, damageType: 'SPECIAL', description: '☣️ 나노 침식 (4x2)' };
      } else if (rand < 0.7) {
        return { type: 'ATTACK', amount: 5, damageType: 'SPECIAL', description: '☣️ 군집 분해 5', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else {
        return { type: 'ATTACK', amount: 3, damageType: 'SPECIAL', description: '☣️ 나노 부식 3', applyDebuff: { status: 'WEAK', amount: 1 } };
      }
    }
    case 'cryo_sentinel': {
      // 특수 + 약화 특화
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 8, damageType: 'SPECIAL', description: '☣️ 냉동 광선 8' };
      } else if (rand < 0.7) {
        return { type: 'ATTACK', amount: 6, damageType: 'SPECIAL', description: '☣️ 동결 파편 6', applyDebuff: { status: 'WEAK', amount: 2 } };
      } else {
        return { type: 'BUFF', amount: 9, description: '🛡️ 냉기 보호막 (방어도 9)' };
      }
    }
    case 'hazmat_worker': {
      // 균형형
      if (rand < 0.35) {
        return { type: 'ATTACK', amount: 7, damageType: 'PHYSICAL', description: '⚔️ 방호 삽 7' };
      } else if (rand < 0.65) {
        return { type: 'ATTACK', amount: 5, damageType: 'SPECIAL', description: '☣️ 화학 스프레이 5', applyDebuff: { status: 'BURN', amount: 1 } };
      } else {
        return { type: 'BUFF', amount: 6, description: '🛡️ 방호복 강화 (방어도 6)' };
      }
    }
    case 'chief_scientist': {
      // 엘리트: 다양한 패턴 + 고데미지
      if (rand < 0.25) {
        return { type: 'ATTACK', amount: 16, damageType: 'SPECIAL', description: '☣️ 플라즈마 주입 16' };
      } else if (rand < 0.5) {
        return { type: 'ATTACK', amount: 12, damageType: 'PHYSICAL', description: '⚔️ 실험체 돌격 (4x3)' };
      } else if (rand < 0.75) {
        return { type: 'BUFF', amount: 14, description: '🛡️ 에너지 실드 (방어도 14)' };
      } else {
        return { type: 'ATTACK', amount: 10, damageType: 'SPECIAL', description: '☣️ 생체 무기 10', applyDebuff: { status: 'VULNERABLE', amount: 2 } };
      }
    }
    case 'war_machine': {
      // 엘리트: 고데미지 물리 + 강력한 방어
      if (rand < 0.3) {
        return { type: 'ATTACK', amount: 20, damageType: 'PHYSICAL', description: '⚔️ 중화기 사격 20' };
      } else if (rand < 0.55) {
        return { type: 'BUFF', amount: 18, description: '🛡️ 장갑 강화 (방어도 18)' };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 8, damageType: 'PHYSICAL', description: '⚔️ 기관총 난사 (4x2)' };
      } else {
        return { type: 'ATTACK', amount: 14, damageType: 'SPECIAL', description: '☣️ 미사일 발사 14', applyDebuff: { status: 'BURN', amount: 2 } };
      }
    }
    case 'director_omega': {
      // 최종 보스: 5패턴
      if (rand < 0.2) {
        return { type: 'BUFF', amount: 20, description: '🛡️ 방주 프로토콜 (방어도 20)' };
      } else if (rand < 0.4) {
        return { type: 'ATTACK', amount: 22, damageType: 'PHYSICAL', description: '⚔️ 궤도 타격 22' };
      } else if (rand < 0.6) {
        return { type: 'ATTACK', amount: 18, damageType: 'SPECIAL', description: '☣️ 오메가 빔 18', applyDebuff: { status: 'BURN', amount: 2 } };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 12, damageType: 'PHYSICAL', description: '⚔️ 기계 군단 (6x2)', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else {
        return { type: 'ATTACK', amount: 15, damageType: 'SPECIAL', description: '☣️ 나노 침식파 15', applyDebuff: { status: 'WEAK', amount: 2 } };
      }
    }

    case 'training_dummy':
      return { type: 'DEFEND', description: '🎯 대기 중...' };

    default:
      return { type: 'UNKNOWN', description: '???' };
  }
};

/**
 * 특정 baseId의 적을 생성하여 새 인스턴스화 하는 공용 함수
 */
export const createEnemy = (baseId: string, rng?: SeededRNG): Enemy => {
  const baseDef = BASE_ENEMIES[baseId];
  if (!baseDef) throw new Error(`Enemy ${baseId} not found`);

  return {
    ...baseDef,
    id: generateUniqueId(),
    currentHp: baseDef.maxHp,
    shield: baseDef.initialShield ?? (baseDef.tier === 'BOSS' ? 20 : 0),
    resist: 0,
    currentIntent: determineNextIntent(baseId, rng) // 초기 랜덤 의도 부여
  };
};

/**
 * 특정 등급 + 챕터의 적 baseId 목록을 반환
 */
export const getEnemyIdsByTier = (tier: EnemyTier, chapter: number = 1): string[] =>
  Object.values(BASE_ENEMIES)
    .filter(e => e.tier === tier && (e.chapter ?? 1) === chapter)
    .map(e => e.baseId);
