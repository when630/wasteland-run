# 전투 VFX 이펙트 카탈로그

전투 중 카드 사용/적 행동 시 재생되는 시각 효과 목록.
구현: `frontend/src/components/pixi/vfx/` (ParticleEngine, vfxProfiles, VfxLayer)

디자인 원칙: **적고 크고 임팩트 있게** — 소수의 굵은 스트로크/충격파/큰 파티클 위주.

---

## 1. 플레이어 카드 이펙트 (16종 카테고리)

### 1.1 BLADE_SLASH — 칼날 베기

단일 대각선 한 줄 베기. 적 중심 관통, 성장 애니메이션(35%까지 0→100% 길이).

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| strike | 타격 | 물리 공격 | BASIC |
| flurry | 연타 | 물리 공격 | UNCOMMON |
| iron_fist | 강철 주먹 | 물리 공격 | UNCOMMON |

### 1.2 HEAVY_KINETIC — 둔기 충격

굵은 수평 임팩트 한 줄 + 충격파 링. 강한 Y축 쉐이크.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| sledgehammer_smash | 대형 오함마 강타 | 물리 공격 | UNCOMMON |
| subway_slam | 지하철 강타 | 물리 공격 | COMMON |
| ark_breach | 방주 돌파 | 물리 공격 | COMMON |
| rail_spike | 레일 스파이크 | 물리 공격 | UNCOMMON |
| knee_crush | 무릎 으깨기 | 물리 공격 | COMMON |
| blind_spot_stab | 사각지대 찌르기 | 물리 공격 | UNCOMMON |
| security_bypass | 보안 우회 | 물리 공격 | COMMON |

### 1.3 GROUND_POUND — 지면 강타

수평 넓은 임팩트 한 줄 + 지면 레벨 충격파. 강한 Y축 쉐이크.

| baseId | 카드명 | 타입 | 등급 | AoE |
|--------|--------|------|------|-----|
| crush | 분쇄 | 물리 공격 | UNCOMMON | X |
| storm_barrage | 폭풍 난타 | 물리 공격 | RARE | O |

### 1.4 BERSERK — 광전사 폭발

X자 이중 베기 (두 줄 교차) + 충격파 + 붉은 화면 플래시.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| berserker_strike | 광전사의 일격 | 물리 공격 | RARE |
| rampage | 폭주 | 물리 공격 | RARE |

### 1.5 HIGH_RPM_FRICTION — 고속 마찰

3연타 짧은 슬래시 (80ms 시차로 순차 등장). 멀티히트 느낌.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| chainsaw_grind | 전기톱 갈아버리기 | 물리 공격 | RARE |

### 1.6 ELECTROMAGNETIC — 전자기 탄환

굵은 직선 궤적(발사→타격) + 임팩트 충격파 링. X축 반동 쉐이크.

| baseId | 카드명 | 타입 | 등급 | 멀티히트 |
|--------|--------|------|------|---------|
| rusty_pistol | 녹슨 권총 | 특수 공격 | BASIC | 1 |
| rapid_fire | 속사 | 특수 공격 | COMMON | 2 |
| piercing_round | 관통탄 | 특수 공격 | COMMON | 1 |
| aimed_shot | 조준 사격 | 특수 공격 | COMMON | 1 |
| tunnel_vision | 터널 시야 | 특수 공격 | UNCOMMON | 1 |
| plasma_cutter | 플라즈마 절단기 | 특수 공격 | UNCOMMON | 1 |
| overcharge_coilgun | 과충전 코일건 | 특수 공격 | RARE | 1 |
| anti_materiel_snipe | 대물 저격 사격 | 특수 공격 | UNCOMMON | 1 |
| third_rail_shock | 제3 레일 충격 | 특수 공격 | RARE | 1 |
| arc_cannon | 아크 캐논 | 특수 공격 | RARE | 1 |

### 1.7 SCATTER_SHOT — 산탄 부채꼴

타겟별 굵은 직선 궤적 + 각 타겟에 임팩트 충격파 링.

| baseId | 카드명 | 타입 | 등급 | AoE |
|--------|--------|------|------|-----|
| shotgun_blast | 산탄 사격 | 특수 공격 | COMMON | O |

### 1.8 THERMAL_AOE — 열/화학 광역

큰 충격파 링 + 4개 큰 원 파티클 상승.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| makeshift_napalm | 급조된 네이팜 | 특수 공격 | RARE |
| toxic_gas_grenade | 수제 독성 가스탄 | 특수 공격 | UNCOMMON |
| emp_overload | EMP 과부하 | 특수 공격 | UNCOMMON |
| seismic_charge | 지진 폭탄 | 특수 공격 | UNCOMMON |

### 1.9 SHIELD_BARRIER — 물리 방어막

배리어 충격파 링 + 3개 큰 사각 파편.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| defend | 수비 | 물리 방어 | BASIC |
| tactical_roll | 전술적 구르기 | 물리 방어 | COMMON |
| torn_car_door | 뜯어낸 차 문짝 | 물리 방어 | COMMON |
| emergency_brake | 비상 브레이크 | 물리 방어 | COMMON |
| spiked_barricade | 가시 돋친 바리케이드 | 물리 방어 | UNCOMMON |
| last_stand | 결사항전 | 물리 방어 | UNCOMMON |
| blast_door | 방폭문 배리어 | 물리 방어 | UNCOMMON |
| containment_protocol | 격리 프로토콜 | 물리 방어 | UNCOMMON |
| shield_bash | 방패로 밀치기 | 물리 방어 | UNCOMMON |
| makeshift_armor | 임시 장갑 | 유틸리티 | UNCOMMON |

### 1.10 FORTRESS — 다층 요새 배리어

이중 배리어 링(시차) + 4개 큰 사각 파편(시차 등장). 희귀 방어 전용.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| iron_wall | 철벽 | 물리 방어 | RARE |
| counter_stance | 반격 태세 | 물리 방어 | RARE |

### 1.11 RESIST_WARD — 특수 방어 워드

에너지 링 + 4개 큰 원 파티클 상승.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| protect | 보호 | 특수 방어 | BASIC |
| contamination_block | 오염 차단 | 특수 방어 | COMMON |
| debris_cover | 잔해 은폐 | 특수 방어 | COMMON |
| lead_coated_cloak | 납 코팅 망토 | 특수 방어 | UNCOMMON |
| emp_grenade | 소형 EMP 투척 | 특수 방어 | UNCOMMON |
| emergency_antidote | 비상용 해독 주사 | 특수 방어 | UNCOMMON |
| gas_mask_filter | 방독면 필터 | 특수 방어 | UNCOMMON |
| rad_shield_gen | 방사선 차폐 발생기 | 특수 방어 | UNCOMMON |
| current_absorber | 전류 흡수망 | 특수 방어 | RARE |
| energy_convert | 에너지 전환 | 특수 방어 | RARE |

### 1.12 HEAL_PULSE — 힐링 펄스

힐 링 + 4개 큰 초록/민트 원 파티클 상승.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| first_aid | 응급 처치 | 특수 방어 | COMMON |
| emergency_repair | 응급 수리 | 유틸리티 | COMMON |
| nano_repair | 나노 수복 | 유틸리티 | UNCOMMON |

### 1.13 BUFF_AURA — 버프 오라

링 + 4개 큰 스파클 원 상승.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| scavenge | 잔해 뒤지기 | 유틸리티 | BASIC |
| ammo_maintenance | 탄약 정비 | 유틸리티 | COMMON |
| alertness | 경계 태세 | 유틸리티 | COMMON |
| loot_search | 전리품 수색 | 유틸리티 | COMMON |
| underground_supplies | 지하 보급품 | 유틸리티 | COMMON |
| battle_meditation | 전투 명상 | 유틸리티 | UNCOMMON |
| plunder | 약탈 | 유틸리티 | UNCOMMON |
| survival_of_fittest | 약육강식 | 유틸리티 | UNCOMMON |
| corporate_secrets | 기업 기밀 문서 | 유틸리티 | RARE |

### 1.14 BLOOD_SACRIFICE — 피의 대가

3개 큰 붉은 방울 하강 + 붉은 플래시 → 2개 큰 금빛 스파클 상승.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| blood_price | 피의 대가 | 유틸리티 | UNCOMMON |
| sacrifice | 희생 | 유틸리티 | UNCOMMON |
| weapon_mod | 무기 개조 | 유틸리티 | UNCOMMON |
| illegal_stimulant | 불법 전투 자극제 | 유틸리티 | RARE |

### 1.15 POWER_SURGE — 파워업 나선

이중 팽창 링 + 4개 큰 나선 원 상승.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| rage | 분노 | 유틸리티 | UNCOMMON |
| fortify | 요새화 | 물리 방어 | RARE |
| frenzy | 광기 | 유틸리티 | RARE |
| phoenix_ash | 불사조의 재 | 유틸리티 | RARE |
| duct_tape_engineering | 청테이프 공학 | 유틸리티 | RARE |
| scrap_recycling | 고철 재활용 공학 | 유틸리티 | RARE |

### 1.16 PURIFY_BURST — 정화 폭발

큰 백색 충격파 링 + 백색 화면 플래시.

| baseId | 카드명 | 타입 | 등급 |
|--------|--------|------|------|
| full_purify | 완전 정화 | 특수 방어 | RARE |

---

## 2. 적 행동 이펙트 (7종)

| 카테고리 | 시각 효과 |
|----------|-----------|
| **ENEMY_MELEE** | 단일 굵은 대각선 슬래시 (플레이어 관통) + Y축 쉐이크 |
| **ENEMY_RANGED** | 굵은 직선 궤적 + 임팩트 충격파 링 + X축 쉐이크 |
| **ENEMY_BUFF** | 충격파 링 + 3개 큰 원 상승 |
| **STATUS_BURN** | 3개 큰 주황/빨강 불꽃 원 상승 |
| **STATUS_POISON** | 3개 큰 녹색 독 거품 원 상승 |
| **ENEMY_DEATH** | 큰 충격파 + 백색 플래시 + 4개 큰 파편 산개 |
| **REFLECT** | 굵은 반사 궤적 + 임팩트 충격파 링 |

---

## 3. 공통 시스템

| 기능 | 설명 |
|------|------|
| **VFX_SCALE** | 전체 시각 배율 2.0 (파티클, 충격파, 선 궤적 모두 적용) |
| **LINE 테이퍼** | 뾰족한 시작 → 넓은 끝 삼각형 형태 |
| **LINE 성장** | 처음 35%에서 길이 0→100% 성장 (긋는 애니메이션) |
| **중심 관통** | LINE 파티클 중점이 타겟 중심에 오도록 시작점 역산 |
| **화면 쉐이크** | X/Y/XY축, 강도(2~14), 감쇠율로 제어 |
| **힛스탑** | 20~100ms 프레임 정지로 타격감 강조 |
| **화면 플래시** | 백색/붉은색 전체 화면 플래시 |
| **충격파** | 팽창 원, easeOutQuad 이징 |
| **파티클 풀** | 150개 사전 할당, free list O(1) 할당/해제 |
| **파티클 셰이프** | RECT(사각형), CIRCLE(원), LINE(테이퍼 삼각형) |

---

## 4. 카드 커버리지 통계

- 전체 카드: 75종
- VFX 적용: **73종** (상태이상 카드 status_burn, status_radiation 2종 제외)
- 플레이어 VFX 카테고리: 16종
- 적 VFX 카테고리: 7종
- 파일 위치: `frontend/src/components/pixi/vfx/vfxProfiles.ts`
