import type { Relic } from '../../types/relicTypes';

// Existing Relic Images
import ImgBloodyBandolier from '../images/relics/relic_bloody_bandolier.webp';
import ImgOldMedkit from '../images/relics/relic_old-world_medkit.webp';
import ImgGlowWatch from '../images/relics/relic_radioactive_glow_watch.webp';
import ImgAlloyPlating from '../images/relics/relic_dual-alloy_plating.webp';
import ImgArcHeart from '../images/relics/relic_unstable_arc_heart.webp';
import ImgOldSheriffBadge from '../images/relics/relic_old_sheriff_badge.webp';
import ImgScrapPartsBracelet from '../images/relics/relic_scrap_parts_bracelet.webp';
import ImgCrackedBrassCompass from '../images/relics/relic_cracked_brass_compass.webp';
import ImgBurntOperationMap from '../images/relics/relic_burnt_operation_map.webp';
import ImgFadedFamilyPhoto from '../images/relics/relic_faded_family_photo.webp';
import ImgBionicCultureHeart from '../images/relics/relic_bionic_culture_heart.webp';
import ImgRedEyeSurveillanceModule from '../images/relics/relic_red_eye_surveillance_module.webp';
import ImgCrackedSunstoneReactor from '../images/relics/relic_cracked_sunstone_reactor.webp';

export const RELICS: Relic[] = [
  // ═══════════════════════════════════════
  // 시작 유물 (STARTER) — 1종
  // ═══════════════════════════════════════
  {
    id: 'survivor_dog_tag',
    name: '황무지 생존자의 인식표',
    tier: 'STARTER',
    description: '전투 종료 시 체력 6을 회복합니다.',
    icon: '🏷️',
  },

  // ═══════════════════════════════════════
  // 일반 유물 (COMMON) — 12종
  // ═══════════════════════════════════════
  {
    id: 'bloody_bandolier',
    name: '피 묻은 가죽 탄띠',
    tier: 'COMMON',
    description: '매 전투 시작 시 탄약 1 획득.',
    image: ImgBloodyBandolier,
  },
  {
    id: 'old_medkit',
    name: '구시대의 구급상자',
    tier: 'COMMON',
    description: '특수 공격으로 적 처치 시 체력 3 회복.',
    image: ImgOldMedkit,
  },
  {
    id: 'old_sheriff_badge',
    name: '구시대의 보안관 배지',
    tier: 'COMMON',
    description: '매 전투 시작 시 물리 방어도 8 획득.',
    image: ImgOldSheriffBadge,
  },
  {
    id: 'rusty_knuckle',
    name: '녹슨 너클',
    tier: 'COMMON',
    description: '물리 공격 카드의 피해 +2.',
    icon: '🥊',
  },
  {
    id: 'makeshift_silencer',
    name: '즉석 소음기',
    tier: 'COMMON',
    description: '특수 공격 카드의 피해 +2.',
    icon: '🔫',
  },
  {
    id: 'lucky_casing',
    name: '행운의 탄피',
    tier: 'COMMON',
    description: '전투 시작 시 첫 턴에 카드 2장 추가 드로우.',
    icon: '📿',
  },
  {
    id: 'emergency_bandage',
    name: '응급 붕대',
    tier: 'COMMON',
    description: '전투 시작 시 체력 4 회복.',
    icon: '🩹',
  },
  {
    id: 'steel_helmet',
    name: '철모',
    tier: 'COMMON',
    description: '전투 시작 시 특수 방어도 6 획득.',
    icon: '🪖',
  },
  {
    id: 'makeshift_trap',
    name: '즉석 함정',
    tier: 'COMMON',
    description: '전투 시작 시 랜덤 적에게 취약 1턴.',
    icon: '🪤',
  },
  {
    id: 'small_battery',
    name: '소형 배터리',
    tier: 'COMMON',
    description: '매 2턴마다 탄약 1 획득.',
    icon: '🔋',
  },
  {
    id: 'relief_crate',
    name: '구호물자 상자',
    tier: 'COMMON',
    description: '전투 시작 시 카드 1장 추가 드로우.',
    icon: '📦',
  },
  {
    id: 'auto_loader',
    name: '자동 장전기',
    tier: 'COMMON',
    description: '탄약이 0인 턴 시작 시 탄약 1 획득.',
    icon: '🔩',
  },

  // ═══════════════════════════════════════
  // 고급 유물 (UNCOMMON) — 12종
  // ═══════════════════════════════════════
  {
    id: 'glow_watch',
    name: '방사능 야광 시계',
    tier: 'UNCOMMON',
    description: '전투 첫 턴 1 AP 추가.',
    image: ImgGlowWatch,
  },
  {
    id: 'scrap_parts_bracelet',
    name: '고철 부품 팔찌',
    tier: 'UNCOMMON',
    description: '한 턴에 물리 공격 3장 이상 사용 시 탄약 1 획득.',
    image: ImgScrapPartsBracelet,
  },
  {
    id: 'cracked_brass_compass',
    name: '금이 간 황동 나침반',
    tier: 'UNCOMMON',
    description: '엘리트전 첫 턴 2 AP 추가, 카드 2장 추가 드로우.',
    image: ImgCrackedBrassCompass,
  },
  {
    id: 'spiked_pauldron',
    name: '가시 어깨받이',
    tier: 'UNCOMMON',
    description: '물리 방어 카드 사용 시 랜덤 적에게 물리 피해 3.',
    icon: '🦔',
  },
  {
    id: 'regen_salve',
    name: '재생 연고',
    tier: 'UNCOMMON',
    description: '특수 방어 카드 사용 시 체력 2 회복.',
    icon: '💊',
  },
  {
    id: 'scrap_collector_relic',
    name: '잔해 수집기',
    tier: 'UNCOMMON',
    description: '카드 소멸 시 탄약 1 획득.',
    icon: '♻️',
  },
  {
    id: 'skull_charm',
    name: '해골 부적',
    tier: 'UNCOMMON',
    description: 'HP 50% 이하일 때 매 턴 카드 1장 추가 드로우.',
    icon: '💀',
  },
  {
    id: 'scope',
    name: '조준경',
    tier: 'UNCOMMON',
    description: '단일 대상 공격 피해 +3 (광역 미적용).',
    icon: '🎯',
  },
  {
    id: 'reinforced_gloves',
    name: '강화 장갑',
    tier: 'UNCOMMON',
    description: '물리 방어 카드 사용 시 물리 방어도 +3 추가.',
    icon: '🧤',
  },
  {
    id: 'lead_insert',
    name: '납판 삽입물',
    tier: 'UNCOMMON',
    description: '특수 방어 카드 사용 시 특수 방어도 +3 추가.',
    icon: '🛡️',
  },
  {
    id: 'hourglass',
    name: '모래시계',
    tier: 'UNCOMMON',
    description: '매 3턴마다 1 AP 추가.',
    icon: '⏳',
  },
  {
    id: 'tactical_vest',
    name: '전술 조끼',
    tier: 'UNCOMMON',
    description: '턴 종료 시 손패 0장이면 다음 턴 카드 2장 추가 드로우.',
    icon: '🃏',
  },

  // ═══════════════════════════════════════
  // 희귀 유물 (RARE) — 10종
  // ═══════════════════════════════════════
  {
    id: 'alloy_plating',
    name: '이중 합금 장갑판',
    tier: 'RARE',
    description: '물리 방어 → 특수 방어도 +2. 특수 방어 → 물리 방어도 +2.',
    image: ImgAlloyPlating,
  },
  {
    id: 'faded_family_photo',
    name: '빛바랜 가족사진',
    tier: 'RARE',
    description: 'HP 0 시 최대 HP의 30%로 부활. (1회용, 소멸)',
    image: ImgFadedFamilyPhoto,
  },
  {
    id: 'tactical_hud',
    name: '전술 HUD',
    tier: 'RARE',
    description: '매 턴 카드 1장 추가 드로우.',
    icon: '📡',
  },
  {
    id: 'welding_gauntlet',
    name: '용접 장갑',
    tier: 'RARE',
    description: '물리 공격으로 적 처치 시 모든 적에게 물리 피해 4.',
    icon: '🔥',
  },
  {
    id: 'magnetic_coil',
    name: '자기장 코일',
    tier: 'RARE',
    description: '턴 종료 시 미사용 AP 1당 물리/특수 방어도 3.',
    icon: '🧲',
  },
  {
    id: 'blood_regulator',
    name: '혈압 조절기',
    tier: 'RARE',
    description: '자해 효과의 체력 감소량 50% 감소.',
    icon: '🌡️',
  },
  {
    id: 'gambler_dice',
    name: '도박사의 주사위',
    tier: 'RARE',
    description: '전투 시작 시 랜덤 보너스 1개 (탄약+2/AP+1/방어도+10/드로우+2).',
    icon: '🎰',
  },
  {
    id: 'ammo_magnet',
    name: '탄약 자석',
    tier: 'RARE',
    description: '적 처치 시 탄약 1 획득.',
    icon: '🧲',
  },
  {
    id: 'perpetual_engine',
    name: '영구 운동 장치',
    tier: 'RARE',
    description: '턴 종료 시 카드 1장 이하 사용 시 카드 2장 드로우.',
    icon: '🔄',
  },
  {
    id: 'berserker_mark',
    name: '광전사의 문양',
    tier: 'RARE',
    description: 'HP 50% 이하일 때 모든 공격 피해 +3.',
    icon: '🩸',
  },

  // ═══════════════════════════════════════
  // 보스 유물 (BOSS) — 8종
  // ═══════════════════════════════════════
  {
    id: 'arc_heart',
    name: '불안정한 아크 심장',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (첫 변화 카드 랜덤 대상)',
    image: ImgArcHeart,
  },
  {
    id: 'bionic_culture_heart',
    name: '생체공학 배양 심장',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (전투 시작 시 방사능 오염 카드 2장 혼입)',
    image: ImgBionicCultureHeart,
  },
  {
    id: 'red_eye_surveillance_module',
    name: '적안의 감시 모듈',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (적 공격 수치 숨김)',
    image: ImgRedEyeSurveillanceModule,
  },
  {
    id: 'cracked_sunstone_reactor',
    name: '균열된 태양석 반응로',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (모닥불 강화 불가)',
    image: ImgCrackedSunstoneReactor,
  },
  {
    id: 'adrenaline_injector',
    name: '아드레날린 주입기',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (매 턴 시작 시 체력 3 감소)',
    icon: '💉',
  },
  {
    id: 'quantum_core',
    name: '양자 코어',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (매 턴 종료 시 손패 1장 랜덤 소멸)',
    icon: '🌀',
  },
  {
    id: 'ancient_prosthetic',
    name: '고대 전투 보철',
    tier: 'BOSS',
    description: '매 턴 +1 AP. 물리 공격 +4. (전투 시작 시 화상 카드 1장 혼입)',
    icon: '⛓️',
  },
  {
    id: 'unstable_teleporter',
    name: '불안정한 텔레포터',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (매 턴 드로우 전 덱 셔플)',
    icon: '🔮',
  },

  // ═══════════════════════════════════════
  // 이벤트 유물 (EVENT) — 6종
  // ═══════════════════════════════════════
  {
    id: 'burnt_operation_map',
    name: '불에 탄 작전 지도',
    tier: 'EVENT',
    description: '휴식/이벤트 진입 시 최대 HP의 5% 회복.',
    image: ImgBurntOperationMap,
  },
  {
    id: 'mutant_claw',
    name: '돌연변이 발톱',
    tier: 'EVENT',
    description: '매 턴 시작 시 랜덤 적에게 물리 피해 3.',
    icon: '🐾',
  },
  {
    id: 'forgotten_manual',
    name: '잊혀진 기술서',
    tier: 'EVENT',
    description: '다음 모닥불 강화 2회 가능.',
    icon: '📖',
  },
  {
    id: 'ruin_charm',
    name: '폐허의 부적',
    tier: 'EVENT',
    description: '전투 시작 시 적 전체에 약화 1턴.',
    icon: '🦴',
  },
  {
    id: 'canned_food',
    name: '통조림 식량',
    tier: 'EVENT',
    description: '휴식 시 체력 회복량 +30%.',
    icon: '🍖',
  },
  {
    id: 'prophecy_orb',
    name: '예언의 수정구',
    tier: 'EVENT',
    description: '적의 다음 턴 의도를 현재 턴에 미리 확인.',
    icon: '🔮',
  },

  // ═══════════════════════════════════════
  // 상점 유물 (SHOP) — 6종
  // ═══════════════════════════════════════
  {
    id: 'merchant_membership',
    name: '상인의 멤버십',
    tier: 'SHOP',
    description: '이후 상점 카드 가격 50% 할인.',
    icon: '💰',
  },
  {
    id: 'concentrated_heal',
    name: '농축 회복제',
    tier: 'SHOP',
    description: '모든 힐 효과 +50%.',
    icon: '🧪',
  },
  {
    id: 'precision_tools',
    name: '정밀 공구',
    tier: 'SHOP',
    description: '카드 강화 시 피해/방어 수치 +1 추가 상승.',
    icon: '📐',
  },
  {
    id: 'weapon_maintenance_kit',
    name: '화기 정비 키트',
    tier: 'SHOP',
    description: '매 턴 시작 시 탄약 1 획득.',
    icon: '🧲',
  },
  {
    id: 'universal_repair_tool',
    name: '만능 수리 도구',
    tier: 'SHOP',
    description: '휴식에서 카드 제거 선택지 추가.',
    icon: '🔧',
  },
  {
    id: 'large_ammo_case',
    name: '대형 탄약통',
    tier: 'SHOP',
    description: '전투 시작 시 탄약 3 획득.',
    icon: '🎒',
  },
];
