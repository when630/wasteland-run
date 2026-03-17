import type { Enemy, Intent, EnemyTier } from '../../types/enemyTypes';
import { generateUniqueId, type SeededRNG } from '../../utils/rng';
import scarecrowImg from '../images/characters/scarecrow.webp';
import scarecrowAttackImg from '../images/characters/scarecrow_attack.webp';
import scarecrowHitImg from '../images/characters/scarecrow_hit.webp';
// 챕터 1 스프라이트
import scrapCollectorImg from '../images/characters/scrap_collector.webp';
import scrapCollectorAttackImg from '../images/characters/scrap_collector_attack.webp';
import scrapCollectorHitImg from '../images/characters/scrap_collector_hit.webp';
import acidDogImg from '../images/characters/acid_dog.webp';
import acidDogAttackImg from '../images/characters/acid_dog_attack.webp';
import acidDogHitImg from '../images/characters/acid_dog_hit.webp';
import wasteSlimeImg from '../images/characters/waste_slime.webp';
import wasteSlimeAttackImg from '../images/characters/waste_slime_attack.webp';
import wasteSlimeHitImg from '../images/characters/waste_slime_hit.webp';
import radiationSpiderImg from '../images/characters/radiation_spider.webp';
import radiationSpiderAttackImg from '../images/characters/radiation_spider_attack.webp';
import radiationSpiderHitImg from '../images/characters/radiation_spider_hit.webp';
import rustMarauderImg from '../images/characters/rust_marauder.webp';
import rustMarauderAttackImg from '../images/characters/rust_marauder_attack.webp';
import rustMarauderHitImg from '../images/characters/rust_marauder_hit.webp';
import scrapTurretImg from '../images/characters/scrap_turret.webp';
import scrapTurretAttackImg from '../images/characters/scrap_turret_attack.webp';
import scrapTurretHitImg from '../images/characters/scrap_turret_hit.webp';
import mutantBehemothImg from '../images/characters/mutant_behemoth.webp';
import mutantBehemothAttackImg from '../images/characters/mutant_behemoth_attack.webp';
import mutantBehemothHitImg from '../images/characters/mutant_behemoth_hit.webp';
import rogueSentryImg from '../images/characters/rogue_sentry.webp';
import rogueSentryAttackImg from '../images/characters/rogue_sentry_attack.webp';
import rogueSentryHitImg from '../images/characters/rogue_sentry_hit.webp';
import mutantSniperImg from '../images/characters/mutant_sniper.webp';
import mutantSniperAttackImg from '../images/characters/mutant_sniper_attack.webp';
import mutantSniperHitImg from '../images/characters/mutant_sniper_hit.webp';
import brutusImg from '../images/characters/brutus.webp';
import brutusAttackImg from '../images/characters/brutus_attack.webp';
import brutusHitImg from '../images/characters/brutus_hit.webp';
// 챕터 1 신규 스프라이트
import rustedWatchbotImg from '../images/characters/rusted_watchbot.webp';
import rustedWatchbotAttackImg from '../images/characters/rusted_watchbot_attack.webp';
import rustedWatchbotHitImg from '../images/characters/rusted_watchbot_hit.webp';
import mutantCrowsImg from '../images/characters/mutant_crows.webp';
import mutantCrowsAttackImg from '../images/characters/mutant_crows_attack.webp';
import mutantCrowsHitImg from '../images/characters/mutant_crows_hit.webp';
import spiderQueenImg from '../images/characters/spider_queen.webp';
import spiderQueenAttackImg from '../images/characters/spider_queen_attack.webp';
import spiderQueenHitImg from '../images/characters/spider_queen_hit.webp';
import stormGeneratorImg from '../images/characters/storm_generator.webp';
import stormGeneratorAttackImg from '../images/characters/storm_generator_attack.webp';
import stormGeneratorHitImg from '../images/characters/storm_generator_hit.webp';
// 챕터 2 스프라이트
import subwayRatImg from '../images/characters/subway_rat.webp';
import subwayRatAttackImg from '../images/characters/subway_rat_attack.webp';
import subwayRatHitImg from '../images/characters/subway_rat_hit.webp';
import railCrawlerImg from '../images/characters/rail_crawler.webp';
import railCrawlerAttackImg from '../images/characters/rail_crawler_attack.webp';
import railCrawlerHitImg from '../images/characters/rail_crawler_hit.webp';
import molePersonImg from '../images/characters/mole_person.webp';
import molePersonAttackImg from '../images/characters/mole_person_attack.webp';
import molePersonHitImg from '../images/characters/mole_person_hit.webp';
import tunnelSpiderImg from '../images/characters/tunnel_spider.webp';
import tunnelSpiderAttackImg from '../images/characters/tunnel_spider_attack.webp';
import tunnelSpiderHitImg from '../images/characters/tunnel_spider_hit.webp';
import electricSlimeImg from '../images/characters/electric_slime.webp';
import electricSlimeAttackImg from '../images/characters/electric_slime_attack.webp';
import electricSlimeHitImg from '../images/characters/electric_slime_hit.webp';
import rustedGolemImg from '../images/characters/rusted_golem.webp';
import rustedGolemAttackImg from '../images/characters/rusted_golem_attack.webp';
import rustedGolemHitImg from '../images/characters/rusted_golem_hit.webp';
import derailedConductorImg from '../images/characters/derailed_conductor.webp';
import derailedConductorAttackImg from '../images/characters/derailed_conductor_attack.webp';
import derailedConductorHitImg from '../images/characters/derailed_conductor_hit.webp';
import shadowLurkerImg from '../images/characters/shadow_lurker.webp';
import shadowLurkerAttackImg from '../images/characters/shadow_lurker_attack.webp';
import shadowLurkerHitImg from '../images/characters/shadow_lurker_hit.webp';
import trackGuardianImg from '../images/characters/track_guardian.webp';
import trackGuardianAttackImg from '../images/characters/track_guardian_attack.webp';
import trackGuardianHitImg from '../images/characters/track_guardian_hit.webp';
import leviathanWormImg from '../images/characters/leviathan_worm.webp';
import leviathanWormAttackImg from '../images/characters/leviathan_worm_attack.webp';
import leviathanWormHitImg from '../images/characters/leviathan_worm_hit.webp';
// 챕터 2 신규 스프라이트
import infectedPassengerImg from '../images/characters/infected_passenger.webp';
import infectedPassengerAttackImg from '../images/characters/infected_passenger_attack.webp';
import infectedPassengerHitImg from '../images/characters/infected_passenger_hit.webp';
import glowingMossImg from '../images/characters/glowing_moss.webp';
import glowingMossAttackImg from '../images/characters/glowing_moss_attack.webp';
import glowingMossHitImg from '../images/characters/glowing_moss_hit.webp';
import derailedTrainImg from '../images/characters/derailed_train.webp';
import derailedTrainAttackImg from '../images/characters/derailed_train_attack.webp';
import derailedTrainHitImg from '../images/characters/derailed_train_hit.webp';
import undergroundLordImg from '../images/characters/underground_lord.webp';
import undergroundLordAttackImg from '../images/characters/underground_lord_attack.webp';
import undergroundLordHitImg from '../images/characters/underground_lord_hit.webp';

type BaseEnemy = Omit<Enemy, 'id' | 'currentHp' | 'shield' | 'resist' | 'currentIntent'> & { chapter?: number; initialShield?: number };

export const BASE_ENEMIES: Record<string, BaseEnemy> = {
  // ===== 디버그: 훈련용 허수아비 =====
  training_dummy: {
    baseId: 'training_dummy',
    tier: 'NORMAL',
    name: '훈련용 허수아비',
    maxHp: 9999,
    chapter: 0,
    spriteUrl: scarecrowImg,
    spriteAttackUrl: scarecrowAttackImg,
    spriteHitUrl: scarecrowHitImg,
  },

  // ===== 챕터 1: 오염된 외곽 도시 =====
  scrap_collector: {
    baseId: 'scrap_collector',
    tier: 'NORMAL',
    name: '고철 수집가',
    maxHp: 45,
    chapter: 1,
    spriteUrl: scrapCollectorImg,
    spriteAttackUrl: scrapCollectorAttackImg,
    spriteHitUrl: scrapCollectorHitImg,
  },
  acid_dog: {
    baseId: 'acid_dog',
    tier: 'NORMAL',
    name: '산성 침 들개',
    maxHp: 28,
    chapter: 1,
    spriteUrl: acidDogImg,
    spriteAttackUrl: acidDogAttackImg,
    spriteHitUrl: acidDogHitImg,
  },
  waste_slime: {
    baseId: 'waste_slime',
    tier: 'NORMAL',
    name: '폐기물 슬라임',
    maxHp: 40,
    chapter: 1,
    spriteUrl: wasteSlimeImg,
    spriteAttackUrl: wasteSlimeAttackImg,
    spriteHitUrl: wasteSlimeHitImg,
  },
  radiation_spider: {
    baseId: 'radiation_spider',
    tier: 'NORMAL',
    name: '방사능 거미',
    maxHp: 22,
    chapter: 1,
    spriteUrl: radiationSpiderImg,
    spriteAttackUrl: radiationSpiderAttackImg,
    spriteHitUrl: radiationSpiderHitImg,
  },
  rust_marauder: {
    baseId: 'rust_marauder',
    tier: 'NORMAL',
    name: '녹슨 약탈자',
    maxHp: 38,
    chapter: 1,
    spriteUrl: rustMarauderImg,
    spriteAttackUrl: rustMarauderAttackImg,
    spriteHitUrl: rustMarauderHitImg,
  },
  scrap_turret: {
    baseId: 'scrap_turret',
    tier: 'NORMAL',
    name: '폐 자동포탑',
    maxHp: 30,
    chapter: 1,
    spriteUrl: scrapTurretImg,
    spriteAttackUrl: scrapTurretAttackImg,
    spriteHitUrl: scrapTurretHitImg,
  },
  // 엘리트 몬스터
  mutant_behemoth: {
    baseId: 'mutant_behemoth',
    tier: 'ELITE',
    name: '돌연변이 베히모스',
    maxHp: 110,
    chapter: 1,
    spriteUrl: mutantBehemothImg,
    spriteAttackUrl: mutantBehemothAttackImg,
    spriteHitUrl: mutantBehemothHitImg,
  },
  rogue_sentry: {
    baseId: 'rogue_sentry',
    tier: 'ELITE',
    name: '폭주하는 경비 드론',
    maxHp: 85,
    chapter: 1,
    spriteUrl: rogueSentryImg,
    spriteAttackUrl: rogueSentryAttackImg,
    spriteHitUrl: rogueSentryHitImg,
  },
  mutant_sniper: {
    baseId: 'mutant_sniper',
    tier: 'ELITE',
    name: '변이 저격수',
    maxHp: 75,
    chapter: 1,
    spriteUrl: mutantSniperImg,
    spriteAttackUrl: mutantSniperAttackImg,
    spriteHitUrl: mutantSniperHitImg,
  },
  // 보스
  brutus: {
    baseId: 'brutus',
    tier: 'BOSS',
    name: '고철 기갑수 브루터스',
    maxHp: 140,
    chapter: 1,
    spriteUrl: brutusImg,
    spriteAttackUrl: brutusAttackImg,
    spriteHitUrl: brutusHitImg,
  },

  // ===== 챕터 2: 무너진 지하철도 =====
  subway_rat: {
    baseId: 'subway_rat',
    tier: 'NORMAL',
    name: '지하철 쥐떼',
    maxHp: 32,
    chapter: 2,
    spriteUrl: subwayRatImg,
    spriteAttackUrl: subwayRatAttackImg,
    spriteHitUrl: subwayRatHitImg,
  },
  rail_crawler: {
    baseId: 'rail_crawler',
    tier: 'NORMAL',
    name: '레일 크롤러',
    maxHp: 50,
    chapter: 2,
    spriteUrl: railCrawlerImg,
    spriteAttackUrl: railCrawlerAttackImg,
    spriteHitUrl: railCrawlerHitImg,
  },
  mole_person: {
    baseId: 'mole_person',
    tier: 'NORMAL',
    name: '두더지 인간',
    maxHp: 35,
    chapter: 2,
    spriteUrl: molePersonImg,
    spriteAttackUrl: molePersonAttackImg,
    spriteHitUrl: molePersonHitImg,
  },
  tunnel_spider: {
    baseId: 'tunnel_spider',
    tier: 'NORMAL',
    name: '터널 거미',
    maxHp: 26,
    chapter: 2,
    spriteUrl: tunnelSpiderImg,
    spriteAttackUrl: tunnelSpiderAttackImg,
    spriteHitUrl: tunnelSpiderHitImg,
  },
  electric_slime: {
    baseId: 'electric_slime',
    tier: 'NORMAL',
    name: '전기 슬라임',
    maxHp: 55,
    chapter: 2,
    spriteUrl: electricSlimeImg,
    spriteAttackUrl: electricSlimeAttackImg,
    spriteHitUrl: electricSlimeHitImg,
  },
  rusted_golem: {
    baseId: 'rusted_golem',
    tier: 'NORMAL',
    name: '녹슨 골렘',
    maxHp: 48,
    chapter: 2,
    spriteUrl: rustedGolemImg,
    spriteAttackUrl: rustedGolemAttackImg,
    spriteHitUrl: rustedGolemHitImg,
  },
  // 챕터 2 엘리트
  derailed_conductor: {
    baseId: 'derailed_conductor',
    tier: 'ELITE',
    name: '탈선한 차장',
    maxHp: 100,
    chapter: 2,
    spriteUrl: derailedConductorImg,
    spriteAttackUrl: derailedConductorAttackImg,
    spriteHitUrl: derailedConductorHitImg,
  },
  shadow_lurker: {
    baseId: 'shadow_lurker',
    tier: 'ELITE',
    name: '그림자 잠복자',
    maxHp: 90,
    chapter: 2,
    spriteUrl: shadowLurkerImg,
    spriteAttackUrl: shadowLurkerAttackImg,
    spriteHitUrl: shadowLurkerHitImg,
  },
  track_guardian: {
    baseId: 'track_guardian',
    tier: 'ELITE',
    name: '궤도 수호자',
    maxHp: 95,
    chapter: 2,
    spriteUrl: trackGuardianImg,
    spriteAttackUrl: trackGuardianAttackImg,
    spriteHitUrl: trackGuardianHitImg,
  },
  // 챕터 2 보스
  leviathan_worm: {
    baseId: 'leviathan_worm',
    tier: 'BOSS',
    name: '심연의 대지렁이 레비아탄',
    maxHp: 180,
    chapter: 2,
    initialShield: 25,
    spriteUrl: leviathanWormImg,
    spriteAttackUrl: leviathanWormAttackImg,
    spriteHitUrl: leviathanWormHitImg,
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

  // ═══════════════════════════════════════
  // 신규 몬스터 (스프라이트 미제작)
  // ═══════════════════════════════════════

  // ── 1막 신규 일반 ──
  rusted_watchbot: {
    baseId: 'rusted_watchbot',
    tier: 'NORMAL',
    name: '녹슨 감시 로봇',
    maxHp: 20,
    chapter: 1,
    spriteUrl: rustedWatchbotImg,
    spriteAttackUrl: rustedWatchbotAttackImg,
    spriteHitUrl: rustedWatchbotHitImg,
  },
  mutant_crows: {
    baseId: 'mutant_crows',
    tier: 'NORMAL',
    name: '변이 까마귀 떼',
    maxHp: 18,
    chapter: 1,
    spriteUrl: mutantCrowsImg,
    spriteAttackUrl: mutantCrowsAttackImg,
    spriteHitUrl: mutantCrowsHitImg,
  },
  // ── 1막 신규 보스 ──
  spider_queen: {
    baseId: 'spider_queen',
    tier: 'BOSS',
    name: '방사능 여왕 거미',
    maxHp: 100,
    chapter: 1,
    spriteUrl: spiderQueenImg,
    spriteAttackUrl: spiderQueenAttackImg,
    spriteHitUrl: spiderQueenHitImg,
  },
  storm_generator: {
    baseId: 'storm_generator',
    tier: 'BOSS',
    name: '폭풍 발전기',
    maxHp: 120,
    chapter: 1,
    initialShield: 15,
    spriteUrl: stormGeneratorImg,
    spriteAttackUrl: stormGeneratorAttackImg,
    spriteHitUrl: stormGeneratorHitImg,
  },

  // ── 2막 신규 일반 ──
  infected_passenger: {
    baseId: 'infected_passenger',
    tier: 'NORMAL',
    name: '감염된 승객',
    maxHp: 40,
    chapter: 2,
    spriteUrl: infectedPassengerImg,
    spriteAttackUrl: infectedPassengerAttackImg,
    spriteHitUrl: infectedPassengerHitImg,
  },
  glowing_moss: {
    baseId: 'glowing_moss',
    tier: 'NORMAL',
    name: '형광 이끼',
    maxHp: 25,
    chapter: 2,
    spriteUrl: glowingMossImg,
    spriteAttackUrl: glowingMossAttackImg,
    spriteHitUrl: glowingMossHitImg,
  },
  // ── 2막 신규 보스 ──
  derailed_train: {
    baseId: 'derailed_train',
    tier: 'BOSS',
    name: '탈선한 기관차',
    maxHp: 200,
    chapter: 2,
    initialShield: 20,
    spriteUrl: derailedTrainImg,
    spriteAttackUrl: derailedTrainAttackImg,
    spriteHitUrl: derailedTrainHitImg,
  },
  underground_lord: {
    baseId: 'underground_lord',
    tier: 'BOSS',
    name: '지하 군주',
    maxHp: 160,
    chapter: 2,
    spriteUrl: undergroundLordImg,
    spriteAttackUrl: undergroundLordAttackImg,
    spriteHitUrl: undergroundLordHitImg,
  },

  // ── 3막 신규 일반 ──
  cleaning_drone: {
    baseId: 'cleaning_drone',
    tier: 'NORMAL',
    name: '방주 청소 드론',
    maxHp: 22,
    chapter: 3,
  },
  experiment_x7: {
    baseId: 'experiment_x7',
    tier: 'NORMAL',
    name: '실험체 X-7',
    maxHp: 45,
    chapter: 3,
  },
  // ── 3막 신규 엘리트 ──
  prototype_fighter: {
    baseId: 'prototype_fighter',
    tier: 'ELITE',
    name: '프로토타입 전투기',
    maxHp: 100,
    chapter: 3,
  },
  // ── 3막 신규 보스 ──
  central_ai: {
    baseId: 'central_ai',
    tier: 'BOSS',
    name: 'AI 중앙통제 시스템',
    maxHp: 180,
    chapter: 3,
    initialShield: 25,
  },
  final_weapon: {
    baseId: 'final_weapon',
    tier: 'BOSS',
    name: '최종 병기 프로젝트',
    maxHp: 250,
    chapter: 3,
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
      // 40% 자기방어, 35% 중간 공격, 25% 강공격
      if (rand < 0.4) {
        return { type: 'BUFF', amount: 5, description: '🛡️ 단단해지기 (방어도 5)' };
      } else if (rand < 0.75) {
        return { type: 'ATTACK', amount: 5, damageType: 'PHYSICAL', description: '⚔️ 짓누르기 5' };
      } else {
        return { type: 'ATTACK', amount: 7, damageType: 'PHYSICAL', description: '⚔️ 산성 덮치기 7' };
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

    // ═══ 신규 몬스터 패턴 ═══

    // 1막 신규
    case 'rusted_watchbot': {
      // 아군 버프 위주, 약한 공격
      if (rand < 0.6) {
        return { type: 'BUFF', amount: 5, description: '🛡️ 아군 방어 강화 (방어도 5)' };
      } else {
        return { type: 'ATTACK', amount: 3, damageType: 'SPECIAL', description: '☣️ 경고 레이저 3' };
      }
    }
    case 'mutant_crows': {
      // 다단 히트, 체력 낮음
      if (rand < 0.5) {
        return { type: 'ATTACK', amount: 2, damageType: 'PHYSICAL', description: '⚔️ 부리 난타 (2x3)' };
      } else {
        return { type: 'ATTACK', amount: 4, damageType: 'PHYSICAL', description: '⚔️ 급강하 4' };
      }
    }
    case 'spider_queen': {
      // 보스: 소환 + 특수 공격 (강화)
      if (rand < 0.2) {
        return { type: 'BUFF', amount: 10, description: '🛡️ 알집 방어 (방어도 10)' };
      } else if (rand < 0.5) {
        return { type: 'ATTACK', amount: 14, damageType: 'SPECIAL', description: '☣️ 독액 분사 14', applyDebuff: { status: 'WEAK', amount: 1 } };
      } else if (rand < 0.75) {
        return { type: 'ATTACK', amount: 10, damageType: 'SPECIAL', description: '☣️ 독거미 소환 (5x2)' };
      } else {
        return { type: 'ATTACK', amount: 8, damageType: 'SPECIAL', description: '☣️ 맹독 주입 8', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }
    case 'storm_generator': {
      // 보스: 전체 특수 공격 + 디버프
      if (rand < 0.25) {
        return { type: 'BUFF', amount: 12, description: '🛡️ 전자기 차폐 (방어도 12)' };
      } else if (rand < 0.5) {
        return { type: 'ATTACK', amount: 10, damageType: 'SPECIAL', description: '☣️ 전기 폭풍 10 (전체)', applyDebuff: { status: 'WEAK', amount: 1 } };
      } else if (rand < 0.75) {
        return { type: 'ATTACK', amount: 14, damageType: 'SPECIAL', description: '☣️ 고압 방전 14' };
      } else {
        return { type: 'ATTACK', amount: 8, damageType: 'SPECIAL', description: '☣️ 연쇄 번개 (4x2)', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }

    // 2막 신규
    case 'infected_passenger': {
      // 느린 강공격, 사망 시 독 폭발 (별도 로직)
      if (rand < 0.4) {
        return { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '⚔️ 좀비 물기 10' };
      } else if (rand < 0.7) {
        return { type: 'ATTACK', amount: 7, damageType: 'PHYSICAL', description: '⚔️ 돌진 7', applyDebuff: { status: 'WEAK', amount: 1 } };
      } else {
        return { type: 'BUFF', amount: 5, description: '🛡️ 썩은 살 방어 (방어도 5)' };
      }
    }
    case 'glowing_moss': {
      // 아군 힐(버프), 약한 특수 공격
      if (rand < 0.6) {
        return { type: 'BUFF', amount: 5, description: '🛡️ 포자 치유 (아군 체력 5 회복)' };
      } else {
        return { type: 'ATTACK', amount: 3, damageType: 'SPECIAL', description: '☣️ 독성 포자 3', applyDebuff: { status: 'WEAK', amount: 1 } };
      }
    }
    case 'derailed_train': {
      // 보스: 3턴 주기 전체 돌진 + 사이 턴 충전
      if (rand < 0.3) {
        return { type: 'BUFF', amount: 15, description: '🛡️ 증기 충전 (방어도 15)' };
      } else if (rand < 0.55) {
        return { type: 'ATTACK', amount: 25, damageType: 'PHYSICAL', description: '⚔️ 기관차 돌진 25' };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 12, damageType: 'PHYSICAL', description: '⚔️ 차륜 분쇄 12', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else {
        return { type: 'ATTACK', amount: 15, damageType: 'PHYSICAL', description: '⚔️ 충돌 파편 (5x3)' };
      }
    }
    case 'underground_lord': {
      // 보스: 졸개 소환 + 버프 (강화)
      if (rand < 0.2) {
        return { type: 'BUFF', amount: 12, description: '🛡️ 지하 왕좌 (방어도 12)' };
      } else if (rand < 0.45) {
        return { type: 'ATTACK', amount: 18, damageType: 'PHYSICAL', description: '⚔️ 왕의 일격 18' };
      } else if (rand < 0.75) {
        return { type: 'ATTACK', amount: 14, damageType: 'SPECIAL', description: '☣️ 암흑 포효 14', applyDebuff: { status: 'WEAK', amount: 2 } };
      } else {
        return { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '⚔️ 졸개 돌격 (5x2)' };
      }
    }

    // 3막 신규
    case 'cleaning_drone': {
      // 약한 특수 공격
      if (rand < 0.5) {
        return { type: 'ATTACK', amount: 4, damageType: 'SPECIAL', description: '☣️ 청소 레이저 4' };
      } else {
        return { type: 'ATTACK', amount: 3, damageType: 'SPECIAL', description: '☣️ 소독 스프레이 3', applyDebuff: { status: 'WEAK', amount: 1 } };
      }
    }
    case 'experiment_x7': {
      // 공격 + 방어 혼합 패턴
      if (rand < 0.35) {
        return { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '⚔️ 변이 팔 강타 10' };
      } else if (rand < 0.6) {
        return { type: 'ATTACK', amount: 7, damageType: 'SPECIAL', description: '☣️ 산성 체액 7', applyDebuff: { status: 'BURN', amount: 1 } };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 12, damageType: 'PHYSICAL', description: '⚔️ 광폭화 난타 (4x3)' };
      } else {
        return { type: 'BUFF', amount: 8, description: '🛡️ 변이 경화 (방어도 8)' };
      }
    }
    case 'prototype_fighter': {
      // 엘리트: 2페이즈 (HP 기반 패턴 변경 — 현재는 혼합)
      if (rand < 0.3) {
        return { type: 'ATTACK', amount: 16, damageType: 'PHYSICAL', description: '⚔️ 프로토 펀치 16' };
      } else if (rand < 0.55) {
        return { type: 'ATTACK', amount: 12, damageType: 'SPECIAL', description: '☣️ 시험용 빔 12', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else if (rand < 0.8) {
        return { type: 'BUFF', amount: 12, description: '🛡️ 장갑 전개 (방어도 12)' };
      } else {
        return { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '⚔️ 기관포 (5x2)', applyDebuff: { status: 'BURN', amount: 1 } };
      }
    }
    case 'central_ai': {
      // 보스: 특수 위주 + 상태이상 카드 주입
      if (rand < 0.2) {
        return { type: 'BUFF', amount: 18, description: '🛡️ 방화벽 (방어도 18)' };
      } else if (rand < 0.4) {
        return { type: 'ATTACK', amount: 16, damageType: 'SPECIAL', description: '☣️ 시스템 해킹 16', applyDebuff: { status: 'WEAK', amount: 2 } };
      } else if (rand < 0.6) {
        return { type: 'ATTACK', amount: 12, damageType: 'SPECIAL', description: '☣️ 데이터 침식 12', applyDebuff: { status: 'BURN', amount: 2 } };
      } else if (rand < 0.8) {
        return { type: 'ATTACK', amount: 20, damageType: 'SPECIAL', description: '☣️ 전자전 포격 20' };
      } else {
        return { type: 'ATTACK', amount: 10, damageType: 'SPECIAL', description: '☣️ 바이러스 살포 (5x2)', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      }
    }
    case 'final_weapon': {
      // 보스: 순수 물리 폭딜, 매 턴 강화
      if (rand < 0.25) {
        return { type: 'ATTACK', amount: 22, damageType: 'PHYSICAL', description: '⚔️ 주포 발사 22' };
      } else if (rand < 0.5) {
        return { type: 'ATTACK', amount: 15, damageType: 'PHYSICAL', description: '⚔️ 기관총 (5x3)' };
      } else if (rand < 0.75) {
        return { type: 'ATTACK', amount: 18, damageType: 'PHYSICAL', description: '⚔️ 미사일 폭격 18', applyDebuff: { status: 'VULNERABLE', amount: 1 } };
      } else {
        return { type: 'BUFF', amount: 15, description: '🛡️ 장갑 강화 (방어도 15)' };
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

// ═══════════════════════════════════════
// 조우 시스템 — 가중치 기반 적 조합
// ═══════════════════════════════════════

export interface Encounter {
  enemies: string[]; // baseId 배열
  weight: number;    // 등장 가중치
}

/** 챕터별 약한/강한 적 조우 테이블 */
export const ENCOUNTER_TABLES: Record<number, { easy: Encounter[]; hard: Encounter[] }> = {
  1: {
    easy: [
      { enemies: ['scrap_collector'], weight: 3 },
      { enemies: ['acid_dog'], weight: 3 },
      { enemies: ['radiation_spider', 'radiation_spider'], weight: 2 },
      { enemies: ['scrap_collector', 'acid_dog'], weight: 2 },
    ],
    hard: [
      { enemies: ['rust_marauder'], weight: 4 },
      { enemies: ['waste_slime'], weight: 3 },
      { enemies: ['scrap_collector', 'scrap_collector'], weight: 3 },
      { enemies: ['scrap_turret', 'acid_dog'], weight: 3 },
      { enemies: ['radiation_spider', 'radiation_spider', 'radiation_spider'], weight: 2 },
      { enemies: ['waste_slime', 'radiation_spider'], weight: 3 },
      { enemies: ['rust_marauder', 'scrap_collector'], weight: 3 },
      { enemies: ['rusted_watchbot', 'scrap_turret'], weight: 2 },
      { enemies: ['mutant_crows', 'acid_dog', 'acid_dog'], weight: 2 },
    ],
  },
  2: {
    easy: [
      { enemies: ['subway_rat', 'tunnel_spider'], weight: 3 },
      { enemies: ['mole_person'], weight: 3 },
      { enemies: ['rail_crawler'], weight: 2 },
      { enemies: ['subway_rat', 'subway_rat'], weight: 2 },
    ],
    hard: [
      { enemies: ['rusted_golem'], weight: 4 },
      { enemies: ['electric_slime'], weight: 3 },
      { enemies: ['mole_person', 'subway_rat'], weight: 3 },
      { enemies: ['rail_crawler', 'tunnel_spider'], weight: 3 },
      { enemies: ['tunnel_spider', 'tunnel_spider', 'tunnel_spider'], weight: 2 },
      { enemies: ['rusted_golem', 'glowing_moss'], weight: 3 },
      { enemies: ['infected_passenger', 'subway_rat', 'subway_rat'], weight: 2 },
      { enemies: ['electric_slime', 'rail_crawler'], weight: 2 },
      { enemies: ['infected_passenger', 'infected_passenger', 'glowing_moss'], weight: 2 },
    ],
  },
  3: {
    easy: [
      { enemies: ['security_drone', 'security_drone'], weight: 3 },
      { enemies: ['corporate_guard', 'hazmat_worker'], weight: 3 },
      { enemies: ['nano_swarm'], weight: 2 },
      { enemies: ['cleaning_drone', 'cleaning_drone', 'cleaning_drone'], weight: 2 },
    ],
    hard: [
      { enemies: ['bio_experiment'], weight: 3 },
      { enemies: ['cryo_sentinel'], weight: 3 },
      { enemies: ['corporate_guard', 'corporate_guard'], weight: 3 },
      { enemies: ['security_drone', 'nano_swarm'], weight: 3 },
      { enemies: ['bio_experiment', 'security_drone'], weight: 3 },
      { enemies: ['cryo_sentinel', 'hazmat_worker'], weight: 2 },
      { enemies: ['experiment_x7'], weight: 2 },
      { enemies: ['experiment_x7', 'cleaning_drone', 'cleaning_drone'], weight: 2 },
      { enemies: ['corporate_guard', 'cryo_sentinel', 'nano_swarm'], weight: 1 },
    ],
  },
};

/** 챕터별 보스 풀 (런 시작 시 1종 랜덤 선택) */
export const BOSS_POOL: Record<number, string[]> = {
  1: ['brutus', 'spider_queen', 'storm_generator'],
  2: ['leviathan_worm', 'derailed_train', 'underground_lord'],
  3: ['director_omega', 'central_ai', 'final_weapon'],
};

/**
 * 가중치 기반 조우 선택
 * @param pool 조우 테이블
 * @param rng 시드 RNG
 * @param lastEncounter 직전 조합 (연속 등장 방지)
 */
export function selectEncounter(
  pool: Encounter[],
  rng: SeededRNG,
  lastEncounter?: string[]
): Encounter {
  // 연속 등장 방지 필터
  let filtered = pool;
  if (lastEncounter && lastEncounter.length > 0) {
    const lastKey = lastEncounter.sort().join(',');
    filtered = pool.filter(e => e.enemies.sort().join(',') !== lastKey);
    if (filtered.length === 0) filtered = pool; // 전부 필터되면 원본 사용
  }

  const totalWeight = filtered.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const encounter of filtered) {
    roll -= encounter.weight;
    if (roll <= 0) return encounter;
  }
  return filtered[filtered.length - 1];
}
