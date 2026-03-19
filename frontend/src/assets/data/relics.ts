import type { Relic } from '../../types/relicTypes';

// Relic Images
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
import ImgSurvivorDogTag from '../images/relics/relic_survivor_dog_tag.webp';
import ImgRustyKnuckle from '../images/relics/relic_rusty_knuckle.webp';
import ImgMakeshiftSilencer from '../images/relics/relic_makeshift_silencer.webp';
import ImgLuckyCasing from '../images/relics/relic_lucky_casing.webp';
import ImgEmergencyBandage from '../images/relics/relic_emergency_bandage.webp';
import ImgSteelHelmet from '../images/relics/relic_steel_helmet.webp';
import ImgMakeshiftTrap from '../images/relics/relic_makeshift_trap.webp';
import ImgSmallBattery from '../images/relics/relic_small_battery.webp';
import ImgReliefCrate from '../images/relics/relic_relief_crate.webp';
import ImgAutoLoader from '../images/relics/relic_auto_loader.webp';
import ImgSpikedPauldron from '../images/relics/relic_spiked_pauldron.webp';
import ImgRegenSalve from '../images/relics/relic_regen_salve.webp';
import ImgScrapCollectorRelic from '../images/relics/relic_scrap_collector_relic.webp';
import ImgSkullCharm from '../images/relics/relic_skull_charm.webp';
import ImgScope from '../images/relics/relic_scope.webp';
import ImgReinforcedGloves from '../images/relics/relic_reinforced_gloves.webp';
import ImgLeadInsert from '../images/relics/relic_lead_insert.webp';
import ImgHourglass from '../images/relics/relic_hourglass.webp';
import ImgTacticalVest from '../images/relics/relic_tactical_vest.webp';
import ImgTacticalHud from '../images/relics/relic_tactical_hud.webp';
import ImgWeldingGauntlet from '../images/relics/relic_welding_gauntlet.webp';
import ImgMagneticCoil from '../images/relics/relic_magnetic_coil.webp';
import ImgBloodRegulator from '../images/relics/relic_blood_regulator.webp';
import ImgGamblerDice from '../images/relics/relic_gambler_dice.webp';
import ImgAmmoMagnet from '../images/relics/relic_ammo_magnet.webp';
import ImgPerpetualEngine from '../images/relics/relic_perpetual_engine.webp';
import ImgBerserkerMark from '../images/relics/relic_berserker_mark.webp';
import ImgAdrenalineInjector from '../images/relics/relic_adrenaline_injector.webp';
import ImgQuantumCore from '../images/relics/relic_quantum_core.webp';
import ImgAncientProsthetic from '../images/relics/relic_ancient_prosthetic.webp';
import ImgUnstableTeleporter from '../images/relics/relic_unstable_teleporter.webp';
import ImgMutantClaw from '../images/relics/relic_mutant_claw.webp';
import ImgForgottenManual from '../images/relics/relic_forgotten_manual.webp';
import ImgRuinCharm from '../images/relics/relic_ruin_charm.webp';
import ImgCannedFood from '../images/relics/relic_canned_food.webp';
import ImgProphecyOrb from '../images/relics/relic_prophecy_orb.webp';
import ImgMerchantMembership from '../images/relics/relic_merchant_membership.webp';
import ImgConcentratedHeal from '../images/relics/relic_concentrated_heal.webp';
import ImgPrecisionTools from '../images/relics/relic_precision_tools.webp';
import ImgWeaponMaintenanceKit from '../images/relics/relic_weapon_maintenance_kit.webp';
import ImgUniversalRepairTool from '../images/relics/relic_universal_repair_tool.webp';
import ImgLargeAmmoCase from '../images/relics/relic_large_ammo_case.webp';

export const RELICS: Relic[] = [
  // ═══════════════════════════════════════
  // 시작 유물 (STARTER) — 1종
  // ═══════════════════════════════════════
  {
    id: 'survivor_dog_tag',
    name: '황무지 생존자의 인식표',
    tier: 'STARTER',
    description: '전투 종료 시 체력 6을 회복합니다.',
    image: ImgSurvivorDogTag,
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
    image: ImgRustyKnuckle,
  },
  {
    id: 'makeshift_silencer',
    name: '즉석 소음기',
    tier: 'COMMON',
    description: '특수 공격 카드의 피해 +2.',
    image: ImgMakeshiftSilencer,
  },
  {
    id: 'lucky_casing',
    name: '행운의 탄피',
    tier: 'COMMON',
    description: '전투 시작 시 첫 턴에 카드 2장 추가 드로우.',
    image: ImgLuckyCasing,
  },
  {
    id: 'emergency_bandage',
    name: '응급 붕대',
    tier: 'COMMON',
    description: '전투 시작 시 체력 4 회복.',
    image: ImgEmergencyBandage,
  },
  {
    id: 'steel_helmet',
    name: '철모',
    tier: 'COMMON',
    description: '전투 시작 시 특수 방어도 6 획득.',
    image: ImgSteelHelmet,
  },
  {
    id: 'makeshift_trap',
    name: '즉석 함정',
    tier: 'COMMON',
    description: '전투 시작 시 랜덤 적에게 취약 1턴.',
    image: ImgMakeshiftTrap,
  },
  {
    id: 'small_battery',
    name: '소형 배터리',
    tier: 'COMMON',
    description: '매 2턴마다 탄약 1 획득.',
    image: ImgSmallBattery,
  },
  {
    id: 'relief_crate',
    name: '구호물자 상자',
    tier: 'COMMON',
    description: '전투 시작 시 카드 1장 추가 드로우.',
    image: ImgReliefCrate,
  },
  {
    id: 'auto_loader',
    name: '자동 장전기',
    tier: 'COMMON',
    description: '탄약이 0인 턴 시작 시 탄약 1 획득.',
    image: ImgAutoLoader,
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
    image: ImgSpikedPauldron,
  },
  {
    id: 'regen_salve',
    name: '재생 연고',
    tier: 'UNCOMMON',
    description: '특수 방어 카드 사용 시 체력 2 회복.',
    image: ImgRegenSalve,
  },
  {
    id: 'scrap_collector_relic',
    name: '잔해 수집기',
    tier: 'UNCOMMON',
    description: '카드 소멸 시 탄약 1 획득.',
    image: ImgScrapCollectorRelic,
  },
  {
    id: 'skull_charm',
    name: '해골 부적',
    tier: 'UNCOMMON',
    description: 'HP 50% 이하일 때 매 턴 카드 1장 추가 드로우.',
    image: ImgSkullCharm,
  },
  {
    id: 'scope',
    name: '조준경',
    tier: 'UNCOMMON',
    description: '단일 대상 공격 피해 +3 (광역 미적용).',
    image: ImgScope,
  },
  {
    id: 'reinforced_gloves',
    name: '강화 장갑',
    tier: 'UNCOMMON',
    description: '물리 방어 카드 사용 시 물리 방어도 +3 추가.',
    image: ImgReinforcedGloves,
  },
  {
    id: 'lead_insert',
    name: '납판 삽입물',
    tier: 'UNCOMMON',
    description: '특수 방어 카드 사용 시 특수 방어도 +3 추가.',
    image: ImgLeadInsert,
  },
  {
    id: 'hourglass',
    name: '모래시계',
    tier: 'UNCOMMON',
    description: '매 3턴마다 1 AP 추가.',
    image: ImgHourglass,
  },
  {
    id: 'tactical_vest',
    name: '전술 조끼',
    tier: 'UNCOMMON',
    description: '턴 종료 시 손패 0장이면 다음 턴 카드 2장 추가 드로우.',
    image: ImgTacticalVest,
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
    image: ImgTacticalHud,
  },
  {
    id: 'welding_gauntlet',
    name: '용접 장갑',
    tier: 'RARE',
    description: '물리 공격으로 적 처치 시 모든 적에게 물리 피해 4.',
    image: ImgWeldingGauntlet,
  },
  {
    id: 'magnetic_coil',
    name: '자기장 코일',
    tier: 'RARE',
    description: '턴 종료 시 미사용 AP 1당 물리/특수 방어도 3.',
    image: ImgMagneticCoil,
  },
  {
    id: 'blood_regulator',
    name: '혈압 조절기',
    tier: 'RARE',
    description: '자해 효과의 체력 감소량 50% 감소.',
    image: ImgBloodRegulator,
  },
  {
    id: 'gambler_dice',
    name: '도박사의 주사위',
    tier: 'RARE',
    description: '전투 시작 시 랜덤 보너스 1개 (탄약+2/AP+1/방어도+10/드로우+2).',
    image: ImgGamblerDice,
  },
  {
    id: 'ammo_magnet',
    name: '탄약 자석',
    tier: 'RARE',
    description: '적 처치 시 탄약 1 획득.',
    image: ImgAmmoMagnet,
  },
  {
    id: 'perpetual_engine',
    name: '영구 운동 장치',
    tier: 'RARE',
    description: '턴 종료 시 카드 1장 이하 사용 시 카드 2장 드로우.',
    image: ImgPerpetualEngine,
  },
  {
    id: 'berserker_mark',
    name: '광전사의 문양',
    tier: 'RARE',
    description: 'HP 50% 이하일 때 모든 공격 피해 +3.',
    image: ImgBerserkerMark,
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
    image: ImgAdrenalineInjector,
  },
  {
    id: 'quantum_core',
    name: '양자 코어',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (매 턴 종료 시 손패 1장 랜덤 소멸)',
    image: ImgQuantumCore,
  },
  {
    id: 'ancient_prosthetic',
    name: '고대 전투 보철',
    tier: 'BOSS',
    description: '매 턴 +1 AP. 물리 공격 +4. (전투 시작 시 화상 카드 1장 혼입)',
    image: ImgAncientProsthetic,
  },
  {
    id: 'unstable_teleporter',
    name: '불안정한 텔레포터',
    tier: 'BOSS',
    description: '매 턴 +1 AP. (매 턴 드로우 전 덱 셔플)',
    image: ImgUnstableTeleporter,
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
    image: ImgMutantClaw,
  },
  {
    id: 'forgotten_manual',
    name: '잊혀진 기술서',
    tier: 'EVENT',
    description: '다음 모닥불 강화 2회 가능.',
    image: ImgForgottenManual,
  },
  {
    id: 'ruin_charm',
    name: '폐허의 부적',
    tier: 'EVENT',
    description: '전투 시작 시 적 전체에 약화 1턴.',
    image: ImgRuinCharm,
  },
  {
    id: 'canned_food',
    name: '통조림 식량',
    tier: 'EVENT',
    description: '휴식 시 체력 회복량 +30%.',
    image: ImgCannedFood,
  },
  {
    id: 'prophecy_orb',
    name: '예언의 수정구',
    tier: 'EVENT',
    description: '적의 다음 턴 의도를 현재 턴에 미리 확인.',
    image: ImgProphecyOrb,
  },

  // ═══════════════════════════════════════
  // 상점 유물 (SHOP) — 6종
  // ═══════════════════════════════════════
  {
    id: 'merchant_membership',
    name: '상인의 멤버십',
    tier: 'SHOP',
    description: '이후 상점 카드 가격 50% 할인.',
    image: ImgMerchantMembership,
  },
  {
    id: 'concentrated_heal',
    name: '농축 회복제',
    tier: 'SHOP',
    description: '모든 힐 효과 +50%.',
    image: ImgConcentratedHeal,
  },
  {
    id: 'precision_tools',
    name: '정밀 공구',
    tier: 'SHOP',
    description: '카드 강화 시 피해/방어 수치 +1 추가 상승.',
    image: ImgPrecisionTools,
  },
  {
    id: 'weapon_maintenance_kit',
    name: '화기 정비 키트',
    tier: 'SHOP',
    description: '매 턴 시작 시 탄약 1 획득.',
    image: ImgWeaponMaintenanceKit,
  },
  {
    id: 'universal_repair_tool',
    name: '만능 수리 도구',
    tier: 'SHOP',
    description: '휴식에서 카드 제거 선택지 추가.',
    image: ImgUniversalRepairTool,
  },
  {
    id: 'large_ammo_case',
    name: '대형 탄약통',
    tier: 'SHOP',
    description: '전투 시작 시 탄약 3 획득.',
    image: ImgLargeAmmoCase,
  },
];
