/**
 * 변이 단계(Mutation Stage) 보정값 계산 — 순수 함수
 * 단계별 효과는 누적 적용된다.
 */

export interface MutationModifiers {
  // 적 스탯 보정
  normalHpMult: number;        // 일반 적 체력 배율
  normalAtkBonus: number;      // 일반 적 공격력 고정 추가
  eliteHpMult: number;         // 엘리트 적 체력 배율
  eliteAtkBonus: number;       // 엘리트 적 공격력 고정 추가
  eliteSpawnBonus: number;     // 엘리트 출현 확률 추가
  bossHpMult: number;          // 보스 체력 배율
  bossAtkBonus: number;        // 보스 공격력 고정 추가

  // 플레이어 불이익
  startMaxHpReduction: number; // 시작 최대 체력 감소
  restHealReduction: number;   // 휴식 회복량 감소 비율 (0.25 = -25%)
  shopPriceMult: number;       // 상점 가격 배율 (1.25 = +25%)
  supplySlotReduction: number; // 보급품 소지 한도 감소
  supplyDropHalved: boolean;   // 보급품 드롭률 절반
  startGoldZero: boolean;      // 시작 골드 0
  startWithBurn: boolean;      // 시작 시 [화상] 카드 추가
  eventBadLuckBonus: number;   // 이벤트 부정 확률 추가
  bossExtraElite: boolean;     // 보스 후 추가 정예전
}

export function getMutationModifiers(stage: number): MutationModifiers {
  return {
    normalHpMult:        1 + (stage >= 2 ? 0.1 : 0) + (stage >= 14 ? 0.1 : 0),
    normalAtkBonus:      (stage >= 8 ? 1 : 0) + (stage >= 17 ? 1 : 0),
    eliteHpMult:         1 + (stage >= 4 ? 0.15 : 0) + (stage >= 18 ? 0.15 : 0),
    eliteAtkBonus:       stage >= 16 ? 2 : 0,
    eliteSpawnBonus:     stage >= 1 ? 0.1 : 0,
    bossHpMult:          1 + (stage >= 7 ? 0.15 : 0) + (stage >= 19 ? 0.15 : 0),
    bossAtkBonus:        (stage >= 12 ? 1 : 0) + (stage >= 19 ? 1 : 0),
    startMaxHpReduction: stage >= 5 ? 7 : 0,
    restHealReduction:   stage >= 6 ? 0.25 : 0,
    shopPriceMult:       stage >= 11 ? 1.25 : 1,
    supplySlotReduction: stage >= 13 ? 1 : 0,
    supplyDropHalved:    stage >= 3,
    startGoldZero:       stage >= 15,
    startWithBurn:       stage >= 10,
    eventBadLuckBonus:   stage >= 9 ? 0.15 : 0,
    bossExtraElite:      stage >= 20,
  };
}

/** 단계별 효과 설명 (UI용) */
export const MUTATION_DESCRIPTIONS: Record<number, { name: string; effect: string }> = {
  1:  { name: '변이 징후',     effect: '엘리트 적 출현 확률 +10%' },
  2:  { name: '강화된 외피',   effect: '일반 적 체력 +10%' },
  3:  { name: '오염된 보급로', effect: '전투 보상 보급품 드롭률 절반' },
  4:  { name: '변이 근육',     effect: '엘리트 적 체력 +15%' },
  5:  { name: '방사능 후유증', effect: '시작 최대 체력 -7' },
  6:  { name: '오염된 수원',   effect: '휴식 체력 회복량 -25%' },
  7:  { name: '변이 핵심부',   effect: '보스 체력 +15%' },
  8:  { name: '독성 강화',     effect: '일반 적 공격력 +1' },
  9:  { name: '불리한 운명',   effect: '이벤트 부정적 확률 +15%' },
  10: { name: '변이 오염',     effect: '시작 시 덱에 [화상] 카드 추가' },
  11: { name: '물가 폭등',     effect: '상점 가격 +25%' },
  12: { name: '변이 군주',     effect: '보스 공격력 +1' },
  13: { name: '보급 차단',     effect: '보급품 소지 한도 -1' },
  14: { name: '변이 확산',     effect: '일반 적 체력 추가 +10%' },
  15: { name: '빈손의 출발',   effect: '시작 골드 0' },
  16: { name: '변이 광전사',   effect: '엘리트 적 공격력 +2' },
  17: { name: '연쇄 변이',     effect: '일반 적 공격력 추가 +1' },
  18: { name: '변이 진화',     effect: '엘리트 적 체력 추가 +15%' },
  19: { name: '최종 변이체',   effect: '보스 체력 +15%, 공격력 +1' },
  20: { name: '완전한 변이',   effect: '보스 처치 후 정예 전투 추가' },
};
