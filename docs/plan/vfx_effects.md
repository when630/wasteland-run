# 전투 VFX 이펙트 카탈로그

전투 중 카드 사용/적 행동 시 재생되는 시각 효과 목록.
구현: `frontend/src/components/pixi/vfx/` (ParticleEngine, vfxProfiles, VfxLayer)

---

## 1. 플레이어 카드 이펙트 (16종 카테고리)

### 1.1 BLADE_SLASH — 칼날 베기

빠른 백색 사선 슬래시 아크 2~3줄 + 미세 파편. 가벼운 쉐이크.

| baseId | 카드명 | 타입 | 등급 | 색상 | 멀티히트 | 비고 |
|--------|--------|------|------|------|---------|------|
| strike | 타격 | 물리 공격 | BASIC | #99aabb | 1 | 기본 카드 |
| flurry | 연타 | 물리 공격 | UNCOMMON | #ccccdd | 2 | 2연타 슬래시 |
| iron_fist | 강철 주먹 | 물리 공격 | UNCOMMON | #aabbcc | 1 | 0코스트 |

### 1.2 HEAVY_KINETIC — 둔기 충격

8~15개 갈색/회색 파편이 사방으로 튀어나감 + 강한 Y축 쉐이크 + 힛스탑.

| baseId | 카드명 | 타입 | 등급 | 색상 | 비고 |
|--------|--------|------|------|------|------|
| sledgehammer_smash | 대형 오함마 강타 | 물리 공격 | UNCOMMON | #999988 | 최대 쉐이크 |
| subway_slam | 지하철 강타 | 물리 공격 | COMMON | #8888aa | |
| ark_breach | 방주 돌파 | 물리 공격 | COMMON | #aaaacc | |
| rail_spike | 레일 스파이크 | 물리 공격 | UNCOMMON | #776655 | |
| knee_crush | 무릎 으깨기 | 물리 공격 | COMMON | #997766 | |
| blind_spot_stab | 사각지대 찌르기 | 물리 공격 | UNCOMMON | #666688 | XY축 쉐이크 |
| security_bypass | 보안 우회 | 물리 공격 | COMMON | #88aacc | XY축 쉐이크 |

### 1.3 GROUND_POUND — 지면 강타

수평 충격파 + 갈색 먼지 파티클 상승 + 돌 파편 좌우 산개. 강한 Y축 쉐이크.

| baseId | 카드명 | 타입 | 등급 | 색상 | AoE | 비고 |
|--------|--------|------|------|------|-----|------|
| crush | 분쇄 | 물리 공격 | UNCOMMON | #aa8866 | X | 취약 보너스 |
| storm_barrage | 폭풍 난타 | 물리 공격 | RARE | #998877 | O | 전체 공격 |

### 1.4 BERSERK — 광전사 폭발

붉은/주황 에너지 파티클이 중심에서 바깥으로 폭발 + 분노 충격파 + 붉은 화면 플래시. 강한 XY축 쉐이크.

| baseId | 카드명 | 타입 | 등급 | 색상 | 비고 |
|--------|--------|------|------|------|------|
| berserker_strike | 광전사의 일격 | 물리 공격 | RARE | #ff3333 | HP 기반 피해 |
| rampage | 폭주 | 물리 공격 | RARE | #ff6622 | 스택형 피해 |

### 1.5 HIGH_RPM_FRICTION — 고속 마찰 스파크

15~25개 주황 스파크 선이 부채꼴로 방사 + 고주파 미세 진동. 멀티히트.

| baseId | 카드명 | 타입 | 등급 | 색상 | 멀티히트 |
|--------|--------|------|------|------|---------|
| chainsaw_grind | 전기톱 갈아버리기 | 물리 공격 | RARE | #ff8800 | 3 |

### 1.6 ELECTROMAGNETIC — 전자기 탄환

즉발 선 궤적(발사→타격) + 충돌 스파크 원 5~8개 + X축 반동 쉐이크.

| baseId | 카드명 | 타입 | 등급 | 색상 | 멀티히트 | 비고 |
|--------|--------|------|------|------|---------|------|
| rusty_pistol | 녹슨 권총 | 특수 공격 | BASIC | #ffff44 | 1 | 기본 카드 |
| rapid_fire | 속사 | 특수 공격 | COMMON | #ffaa22 | 2 | 2연발 |
| piercing_round | 관통탄 | 특수 공격 | COMMON | #ddcc44 | 1 | |
| aimed_shot | 조준 사격 | 특수 공격 | COMMON | #eedd33 | 1 | |
| tunnel_vision | 터널 시야 | 특수 공격 | UNCOMMON | #ffcc22 | 1 | |
| plasma_cutter | 플라즈마 절단기 | 특수 공격 | UNCOMMON | #ff44ff | 1 | |
| overcharge_coilgun | 과충전 코일건 | 특수 공격 | RARE | #66ddff | 1 | 탄약 전소모 |
| anti_materiel_snipe | 대물 저격 사격 | 특수 공격 | UNCOMMON | #ff4444 | 1 | 최대 쉐이크 |
| third_rail_shock | 제3 레일 충격 | 특수 공격 | RARE | #44eeff | 1 | |
| arc_cannon | 아크 캐논 | 특수 공격 | RARE | #88ccff | 1 | |

### 1.7 SCATTER_SHOT — 산탄 부채꼴

발사점→타겟별 다중 선 궤적 + 빗나간 탄 2~4발 추가 + 각 타겟에 스파크. X축 쉐이크.

| baseId | 카드명 | 타입 | 등급 | 색상 | AoE |
|--------|--------|------|------|------|-----|
| shotgun_blast | 산탄 사격 | 특수 공격 | COMMON | #ff8844 | O |

### 1.8 THERMAL_AOE — 열/화학 광역

팽창 충격파 원(반경 120~150px) + 20~30개 아지랑이 상승 파티클. XY축 쉐이크.

| baseId | 카드명 | 타입 | 등급 | 색상 | 비고 |
|--------|--------|------|------|------|------|
| makeshift_napalm | 급조된 네이팜 | 특수 공격 | RARE | #ff3300 | 화상 부여 |
| toxic_gas_grenade | 수제 독성 가스탄 | 특수 공격 | UNCOMMON | #44ff44 | 맹독 부여 |
| emp_overload | EMP 과부하 | 특수 공격 | UNCOMMON | #44ccff | 약화 부여 |
| seismic_charge | 지진 폭탄 | 특수 공격 | UNCOMMON | #ffaa22 | 취약 부여 |

### 1.9 SHIELD_BARRIER — 물리 방어막

10~15개 파란 육각 파편이 플레이어 앞에서 위로 퍼짐 + 배리어 충격파(반원). 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 |
|--------|--------|------|------|------|
| defend | 수비 | 물리 방어 | BASIC | #3388dd |
| tactical_roll | 전술적 구르기 | 물리 방어 | COMMON | #3377ee |
| torn_car_door | 뜯어낸 차 문짝 | 물리 방어 | COMMON | #6699cc |
| emergency_brake | 비상 브레이크 | 물리 방어 | COMMON | #5588dd |
| spiked_barricade | 가시 돋친 바리케이드 | 물리 방어 | UNCOMMON | #5599ff |
| last_stand | 결사항전 | 물리 방어 | UNCOMMON | #4466ff |
| blast_door | 방폭문 배리어 | 물리 방어 | UNCOMMON | #7799ee |
| containment_protocol | 격리 프로토콜 | 물리 방어 | UNCOMMON | #4477dd |
| shield_bash | 방패로 밀치기 | 물리 방어 | UNCOMMON | #4488cc |
| makeshift_armor | 임시 장갑 | 유틸리티 | UNCOMMON | #5588cc |

### 1.10 FORTRESS — 다층 요새 배리어

16~23개 다층(3겹) 육각 배리어 파편 + 이중 충격파. 희귀 방어 전용. 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 | 비고 |
|--------|--------|------|------|------|------|
| iron_wall | 철벽 | 물리 방어 | RARE | #5599ee | 소멸 |
| counter_stance | 반격 태세 | 물리 방어 | RARE | #6688dd | 반사 8 |

### 1.11 RESIST_WARD — 특수 방어 워드

12~19개 보라/시안 에너지 원이 플레이어 주변 타원형으로 상승 + 워드 충격파 링. 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 |
|--------|--------|------|------|------|
| protect | 보호 | 특수 방어 | BASIC | #9966ee |
| contamination_block | 오염 차단 | 특수 방어 | COMMON | #77aadd |
| debris_cover | 잔해 은폐 | 특수 방어 | COMMON | #8899bb |
| lead_coated_cloak | 납 코팅 망토 | 특수 방어 | UNCOMMON | #9955ee |
| emp_grenade | 소형 EMP 투척 | 특수 방어 | UNCOMMON | #55ccff |
| emergency_antidote | 비상용 해독 주사 | 특수 방어 | UNCOMMON | #66ffaa |
| gas_mask_filter | 방독면 필터 | 특수 방어 | UNCOMMON | #88bb66 |
| rad_shield_gen | 방사선 차폐 발생기 | 특수 방어 | UNCOMMON | #bb88ff |
| current_absorber | 전류 흡수망 | 특수 방어 | RARE | #44ddff |
| energy_convert | 에너지 전환 | 특수 방어 | RARE | #55ddee |

### 1.12 HEAL_PULSE — 힐링 펄스

10~15개 초록/민트 원 파티클이 부드럽게 상승 + 힐 펄스 링. 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 |
|--------|--------|------|------|------|
| first_aid | 응급 처치 | 특수 방어 | COMMON | #44cc88 |
| emergency_repair | 응급 수리 | 유틸리티 | COMMON | #44dd88 |
| nano_repair | 나노 수복 | 유틸리티 | UNCOMMON | #44ffcc |

### 1.13 BUFF_AURA — 버프 오라

8~13개 금빛 스파클이 플레이어 주변에서 위로 상승. 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 |
|--------|--------|------|------|------|
| scavenge | 잔해 뒤지기 | 유틸리티 | BASIC | #ffcc44 |
| ammo_maintenance | 탄약 정비 | 유틸리티 | COMMON | #ccaa33 |
| alertness | 경계 태세 | 유틸리티 | COMMON | #dddd66 |
| loot_search | 전리품 수색 | 유틸리티 | COMMON | #ddbb44 |
| underground_supplies | 지하 보급품 | 유틸리티 | COMMON | #ddaa44 |
| battle_meditation | 전투 명상 | 유틸리티 | UNCOMMON | #aabb88 |
| plunder | 약탈 | 유틸리티 | UNCOMMON | #ddaa33 |
| survival_of_fittest | 약육강식 | 유틸리티 | UNCOMMON | #ff8844 |
| corporate_secrets | 기업 기밀 문서 | 유틸리티 | RARE | #ffdd66 |

### 1.14 BLOOD_SACRIFICE — 피의 대가

8~12개 붉은 방울이 아래로 떨어짐 + 붉은 화면 플래시 → 이후 6~9개 금빛 스파클 상승(이득 표현). 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 | 비고 |
|--------|--------|------|------|------|------|
| blood_price | 피의 대가 | 유틸리티 | UNCOMMON | #ff2222 | HP -4, 드로우 2 |
| sacrifice | 희생 | 유틸리티 | UNCOMMON | #cc3333 | 카드 소멸→AP |
| weapon_mod | 무기 개조 | 유틸리티 | UNCOMMON | #dd4422 | 카드 소멸→피해+ |
| illegal_stimulant | 불법 전투 자극제 | 유틸리티 | RARE | #ff4433 | HP -3, AP+드로우 |

### 1.15 POWER_SURGE — 파워업 나선

12~17개 나선형 에너지 파티클이 회전하며 상승 + 이중 팽창 링. 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 | 비고 |
|--------|--------|------|------|------|------|
| rage | 분노 | 유틸리티 | UNCOMMON | #ff4444 | [지속] 물리 피격→방어 |
| fortify | 요새화 | 물리 방어 | RARE | #4488ff | [지속] 턴 시작→방어 |
| frenzy | 광기 | 유틸리티 | RARE | #ff3344 | [지속] 저HP→피해+ |
| phoenix_ash | 불사조의 재 | 유틸리티 | RARE | #ff6644 | [지속] 소멸→방어 |
| duct_tape_engineering | 청테이프 공학 | 유틸리티 | RARE | #88ccaa | [지속] 물리→피해+ |
| scrap_recycling | 고철 재활용 공학 | 유틸리티 | RARE | #aacc44 | [지속] 방어→탄약 |

### 1.16 PURIFY_BURST — 정화 폭발

16~23개 백색 파티클이 중심에서 방사형으로 폭발 + 정화 충격파 + 백색 화면 플래시. 쉐이크 없음.

| baseId | 카드명 | 타입 | 등급 | 색상 | 비고 |
|--------|--------|------|------|------|------|
| full_purify | 완전 정화 | 특수 방어 | RARE | #eeffff | 전체 디버프 해제 |

---

## 2. 적 행동 이펙트 (7종)

| 카테고리 | 시각 효과 | 색상 |
|----------|-----------|------|
| **ENEMY_MELEE** | 대각선 슬래시 선 2~3줄 + 충돌 파편 5~8개 + Y축 쉐이크 | #ff4444 |
| **ENEMY_RANGED** | 에너지 탄환 선 궤적 + 충돌 스파크 4~6개 + X축 쉐이크 | #aa44ff |
| **ENEMY_BUFF** | 위로 상승하는 파란 파티클 6~9개 + 작은 충격파 | #4488ff |
| **STATUS_BURN** | 주황/빨강 불꽃 원 6~10개 위로 흔들리며 상승 | #ff6600 |
| **STATUS_POISON** | 녹색 독 거품 원 5~8개 위로 떠오름 | #22ff44 |
| **ENEMY_DEATH** | 흰/회색 파편 12~19개 사방 폭발 + 충격파 + 백색 플래시 | #ffffff |
| **REFLECT** | 플레이어→적 방향 짧은 선 궤적 + 주황 스파크 4~6개 | #ff8844 |

---

## 3. 공통 시스템

| 기능 | 설명 |
|------|------|
| **화면 쉐이크** | X/Y/XY축, 강도(2~14), 감쇠율로 제어 |
| **힛스탑** | 20~100ms 프레임 정지로 타격감 강조 |
| **화면 플래시** | 백색/붉은색 전체 화면 플래시 (사망, 광전사, 정화, 자해) |
| **충격파** | 팽창 원, easeOutQuad 이징, 0.35~0.7 알파 |
| **선 궤적** | 즉발 직선, 두께 감쇠, 잔상 효과 |
| **파티클 풀** | 200개 사전 할당, GC 압력 방지 |
| **파티클 셰이프** | RECT(회전 사각형), CIRCLE(원), LINE(선분) |
| **아지랑이** | `sin(life * 0.008 + y * 0.01) * 0.3` 흔들림 (gravity < 0인 CIRCLE) |

---

## 4. 카드 커버리지 통계

- 전체 카드: 75종 (기본 5 + 물리공격 14 + 특수공격 14 + 물리방어 11 + 특수방어 11 + 유틸리티 20)
- VFX 적용: **73종** (상태이상 카드 status_burn, status_radiation 2종 제외)
- 플레이어 VFX 카테고리: 16종
- 적 VFX 카테고리: 7종
- 파일 위치: `frontend/src/components/pixi/vfx/vfxProfiles.ts`
