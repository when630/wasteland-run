import type { Relic } from '../../types/relicTypes';

// Existing Relic Images
import ImgBloodyBandolier from '../images/relics/relic_bloody_bandolier.webp';
import ImgOldMedkit from '../images/relics/relic_old-world_medkit.webp';
import ImgGlowWatch from '../images/relics/relic_radioactive_glow_watch.webp';
import ImgAlloyPlating from '../images/relics/relic_dual-alloy_plating.webp';
import ImgArcHeart from '../images/relics/relic_unstable_arc_heart.webp';

// New Relic Images
import ImgOldSheriffBadge from '../images/relics/relic_old_sheriff_badge.webp';
import ImgScrapPartsBracelet from '../images/relics/relic_scrap_parts_bracelet.webp';
import ImgCrackedBrassCompass from '../images/relics/relic_cracked_brass_compass.webp';
import ImgBurntOperationMap from '../images/relics/relic_burnt_operation_map.webp';
import ImgFadedFamilyPhoto from '../images/relics/relic_faded_family_photo.webp';
import ImgBionicCultureHeart from '../images/relics/relic_bionic_culture_heart.webp';
import ImgRedEyeSurveillanceModule from '../images/relics/relic_red_eye_surveillance_module.webp';
import ImgCrackedSunstoneReactor from '../images/relics/relic_cracked_sunstone_reactor.webp';

export const RELICS: Relic[] = [
  // ============================
  // 기존 유물 5종 (relics.md)
  // ============================
  {
    id: 'bloody_bandolier',
    name: '피 묻은 가죽 탄띠',
    tier: 'COMMON',
    description: '매 전투 시작 시 [탄약] 1을 가지고 시작합니다.',
    image: ImgBloodyBandolier,
  },
  {
    id: 'old_medkit',
    name: '구시대의 구급상자',
    tier: 'COMMON',
    description: '[특수 공격] 카드로 적을 처치할 때마다 체력을 3 회복합니다.',
    image: ImgOldMedkit,
  },
  {
    id: 'glow_watch',
    name: '방사능 야광 시계',
    tier: 'UNCOMMON',
    description: '매 전투의 첫 턴에 행동력(AP)을 1 추가로 얻습니다.',
    image: ImgGlowWatch,
  },
  {
    id: 'alloy_plating',
    name: '이중 합금 장갑판',
    tier: 'RARE',
    description: '[물리 방어] 사용 시 특수 방어도 2 획득. [특수 방어] 사용 시 물리 방어도 2 획득.',
    image: ImgAlloyPlating,
  },
  {
    id: 'arc_heart',
    name: '불안정한 아크 심장',
    tier: 'BOSS',
    description: '매 턴 시작 시 행동력(AP)을 1 추가로 얻습니다. (매 턴 첫 번째로 사용하는 [변화] 카드가 무작위 대상을 지정합니다.)',
    image: ImgArcHeart,
  },

  // ============================
  // 신규 유물 8종 (relics2.md)
  // ============================
  {
    id: 'old_sheriff_badge',
    name: '구시대의 보안관 배지',
    tier: 'COMMON',
    description: '매 전투 시작 시 물리 방어도 8을 가지고 시작합니다.',
    image: ImgOldSheriffBadge,
  },
  {
    id: 'scrap_parts_bracelet',
    name: '고철 부품 팔찌',
    tier: 'UNCOMMON',
    description: '한 턴에 \'물리 공격\' 카드를 3장 이상 사용할 경우, 즉시 탄약 1을 획득합니다.',
    image: ImgScrapPartsBracelet,
  },
  {
    id: 'cracked_brass_compass',
    name: '금이 간 황동 나침반',
    tier: 'UNCOMMON',
    description: '맵에서 \'위험 구역(엘리트)\' 노드 진입 시, 첫 턴에 2 AP를 추가로 얻고 카드를 2장 더 뽑습니다.',
    image: ImgCrackedBrassCompass,
  },
  {
    id: 'burnt_operation_map',
    name: '불에 탄 작전 지도',
    tier: 'RARE',
    description: '\'미확인 신호(이벤트)\' 및 \'안전 가옥(모닥불)\' 노드 진입 시, 최대 체력의 5%를 즉시 회복합니다.',
    image: ImgBurntOperationMap,
  },
  {
    id: 'faded_family_photo',
    name: '빛바랜 가족사진',
    tier: 'RARE',
    description: '체력이 0이 되는 치명적인 피해를 입을 때, 죽지 않고 최대 체력의 30%로 부활합니다.',
    image: ImgFadedFamilyPhoto,
  },
  {
    id: 'bionic_culture_heart',
    name: '생체공학 배양 심장',
    tier: 'BOSS',
    description: '매 턴 시작 시 행동력(AP)을 1 추가로 얻습니다. (매 전투 시작 시 덱에 \'방사능 오염\' 상태이상 카드 2장 혼합)',
    image: ImgBionicCultureHeart,
  },
  {
    id: 'red_eye_surveillance_module',
    name: '적안의 감시 모듈',
    tier: 'BOSS',
    description: '매 턴 시작 시 행동력(AP)을 1 추가로 얻습니다. 단, 적의 의도 중 구체적인 데미지 수치가 보이지 않게 됩니다.',
    image: ImgRedEyeSurveillanceModule,
  },
  {
    id: 'cracked_sunstone_reactor',
    name: '균열된 태양석 반응로',
    tier: 'BOSS',
    description: '매 턴 시작 시 행동력(AP)을 1 추가로 얻습니다. 모닥불에서 더 이상 카드를 \'강화(Upgrade)\'할 수 없습니다.',
    image: ImgCrackedSunstoneReactor,
  }
];
