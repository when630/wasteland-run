# 미제작 에셋 목록

> 최종 업데이트: 2026-03-19

---

## 요약

| 카테고리 | 전체 | 완료 | 미완료 | 완성도 |
|----------|------|------|--------|--------|
| 적 스프라이트 (idle/attack/hit) | 43종 (129벌) | 43종 (129벌) | 0 | 100% |
| 유물 이미지 | 60종 | 55종 | 5종 | 92% |
| 보급품 이미지 | 30종 | 0 | 30종 | 0% |
| 배경 이미지 | 10종 | 10종 | 0 | 100% |
| GUI 아이콘 | 54종 | 54종 | 0 | 100% |
| 맵 노드 뱃지 | 7종 | 7종 | 0 | 100% |
| 플레이어+NPC 스프라이트 | 8종 | 8종 | 0 | 100% |
| 앱 아이콘 | 4종 | 4종 | 0 | 100% |
| 폰트 | 2종 | 2종 | 0 | 100% |
| 카드 아트 | 75장 | 0 | 75장 | 0% |
| BGM | ~8트랙 | 0 | ~8 | 0% |
| SFX | ~17종 | 0 | ~17 | 0% |

---

## 1. 유물 이미지 (5종 미완료)

> 파일 규칙: `relic_{id}.webp` → `frontend/src/assets/images/relics/`
> 55종 완료, 5종은 보급품 연관 신규 유물 (이모지 아이콘 대체 중)

### 보급품 연관 유물 (5종 — 이미지 없음, 이모지 사용)

| id | 이름 | 현재 아이콘 | 비주얼 힌트 |
|----|------|------------|-----------|
| large_backpack | 대형 배낭 | 🎒 | 황무지 가죽 배낭, 주머니 많음, 보급품 포켓 |
| supply_officer_armband | 보급 장교 완장 | 🎖️ | 군용 완장, 보급부대 마크, 패치 |
| first_aid_manual | 응급 처치 교범 | 📕 | 빨간 표지 군용 매뉴얼, 십자 마크 |
| scrap_distiller | 폐품 증류기 | ⚗️ | 구리관 연결된 소형 증류 장치 |
| vow_of_abstinence | 금욕의 서약 | 🚫 | 붉은 인장이 찍힌 낡은 서약서 |

---

## 2. 보급품 이미지 (30종 전부 미완료)

> 파일 규칙: `supply_{id}.webp` → `frontend/src/assets/images/supplies/` (폴더 미생성)
> 현재 전부 이모지 아이콘 대체 중. 우선순위 중간.

### COMMON (12종)

| id | 이름 | 현재 아이콘 | 비주얼 힌트 |
|----|------|------------|-----------|
| emergency_ration | 비상 식량 팩 | 🍞 | 군용 MRE 포장, 은박 포장 |
| purified_water | 정제수 캔 | 💧 | 은색 캔, "PURIFIED" 라벨 |
| energy_gel | 에너지 젤 | ⚡ | 투명 파란 젤 파우치 |
| spare_magazine | 임시 탄창 | 🔩 | 테이프로 묶은 탄창 2개 |
| stimulant_shot | 자극제 주사 | 💉 | 노란 액체 자동 주사기 |
| emergency_tourniquet | 응급 지혈대 | 🩹 | 빨간 군용 지혈대 |
| shielding_panel | 차폐 패널 | 🛡️ | 납 코팅 금속 패널 |
| rusty_grenade | 녹슨 수류탄 | 💣 | 녹슨 파편 수류탄, 핀 달림 |
| smoke_canister | 연막 캔 | 🌫️ | 회색 캔, 연기 분출 |
| flashbang | 섬광탄 | ✨ | 은색 원통, 번쩍이는 효과 |
| sticky_bomb | 접착 폭탄 | 🧨 | 접착제 묻은 소형 폭탄 |
| old_painkiller | 오래된 진통제 | 💊 | 낡은 약병, 흰 알약 |

### UNCOMMON (10종)

| id | 이름 | 현재 아이콘 | 비주얼 힌트 |
|----|------|------------|-----------|
| military_ration | 군용 레이션 | 🥫 | 국방색 군용 식량 팩 |
| combat_stimulant | 전투 흥분제 | 🔴 | 빨간 캡슐 주사기 |
| overcharge_cell | 과부하 셀 | 🔋 | 빛나는 파란 에너지 셀 |
| tactical_ammo_belt | 전술 탄약 벨트 | 🎖️ | 탄창 가득 달린 벨트 |
| composite_plate | 복합 방탄판 | 🪨 | 세라믹+케블라 복합 패널 |
| detox_kit | 해독 키트 | 🧪 | 초록 해독제 + 주사기 세트 |
| chemical_bomb | 화학 폭탄 | ☣️ | 노란 경고표 플라스크 폭탄 |
| emp_grenade | EMP 수류탄 | ⚡ | 파란 전자기 펄스 수류탄 |
| field_repair_tool | 야전 수리 도구 | 🔧 | 접이식 만능 공구 세트 |
| blood_transfusion | 응급 수혈 팩 | 🩸 | 빨간 수혈 팩 + 튜브 |

### RARE (8종)

| id | 이름 | 현재 아이콘 | 비주얼 힌트 |
|----|------|------------|-----------|
| nano_repair_shot | 나노 수복 주사 | 💎 | 은빛 나노 입자 주사기 |
| berserker_serum | 광전사 혈청 | 🩸 | 검붉은 혈청 바이알 |
| quantum_purifier | 양자 정화기 | 🌀 | 보라빛 소형 정화 장치 |
| tactical_warhead | 전술 핵탄두 | ☢️ | 소형 전술 탄두, 방사능 표시 |
| nano_field | 나노 필드 | 🔰 | 푸른 에너지 방어막 생성기 |
| time_distorter | 시간 왜곡기 | ⏳ | 시계 부품 + 보라 에너지 장치 |
| full_resupply | 완전 재보급 | 📦 | 대형 군용 보급 상자 |
| bio_enhancer | 생체 강화 주사 | 🧬 | DNA 나선 문양 녹색 주사기 |

---

## 3. 오디오 (전부 미완료)

`useAudioStore`에 Web Audio API 기반 오디오 시스템 구현됨.
실제 오디오 파일 없음 (`frontend/src/assets/sounds/` 비어있음).

### BGM (~8트랙)

| 파일명 | 사용처 | 분위기 |
|--------|--------|--------|
| bgm_main_menu | 메인 메뉴 | 어둡고 잔잔한 포스트아포칼립스 |
| bgm_map | 맵 탐색 | 긴장감 있는 탐험 |
| bgm_battle_normal | 일반 전투 | 중간 템포 전투 |
| bgm_battle_elite | 엘리트 전투 | 빠르고 위협적 |
| bgm_battle_boss | 보스 전투 | 강렬하고 서사적 |
| bgm_rest | 모닥불 | 따뜻하고 안정적 |
| bgm_shop | 상점 | 가벼운 거래 분위기 |
| bgm_event | 이벤트 | 미스터리/호기심 |

### SFX (~17종)

| 파일명 | 사용처 |
|--------|--------|
| sfx_card_play | 카드 사용 |
| sfx_card_draw | 카드 드로우 |
| sfx_hit_physical | 물리 타격 |
| sfx_hit_special | 특수 타격 |
| sfx_shield | 방어도 획득 |
| sfx_heal | 회복 |
| sfx_damage_player | 플레이어 피격 |
| sfx_enemy_death | 적 사망 |
| sfx_gold | 골드 획득 |
| sfx_relic | 유물 획득 |
| sfx_button_click | UI 버튼 클릭 |
| sfx_victory | 전투 승리 |
| sfx_defeat | 전투 패배 |
| sfx_burn_tick | 화상 도트 |
| sfx_poison_tick | 중독 도트 |
| sfx_upgrade | 카드 강화 |
| sfx_chapter_clear | 챕터 클리어 |

---

## 4. 카드 아트 (75장 전부 미완료)

현재 카드는 타입 아이콘 + 텍스트 프레임으로 표현. 전용 일러스트 없음.
BASIC 10, COMMON 25, UNCOMMON 20, RARE 15, STATUS 5.

> 우선순위 낮음 — 현재 카드 프레임 디자인으로 충분히 플레이 가능.

---

## 5. 파일명 이슈 (해결 완료)

- ~~`adiation_spider*.webp`~~ → `radiation_spider*.webp` 으로 수정 완료 (2026-03-19)
- ~~`stage*_battle_backgroung.webp`~~ → `stage*_battle_background.webp` 으로 수정 완료 (2026-03-19)

---

## 6. 완료된 에셋

### 적 스프라이트 (43종 × 3벌 = 129파일) ✅ 100%
**1막 일반 (10종):** scrap_collector, acid_dog, waste_slime, radiation_spider, rust_marauder, scrap_turret, mutant_behemoth, rogue_sentry, mutant_sniper, mutant_crows
**1막 엘리트 (2종):** brutus, rusted_watchbot
**1막 보스 (2종):** spider_queen, storm_generator
**2막 일반 (8종):** subway_rat, mole_person, tunnel_spider, electric_slime, infected_passenger, glowing_moss, derailed_conductor, shadow_lurker
**2막 엘리트 (2종):** rusted_golem, track_guardian
**2막 보스 (2종):** derailed_train, underground_lord, leviathan_worm
**3막 일반 (8종):** security_drone, bio_experiment, corporate_guard, nano_swarm, cryo_sentinel, hazmat_worker, cleaning_drone, experiment_x7
**3막 엘리트 (3종):** chief_scientist, war_machine, prototype_fighter
**3막 보스 (3종):** director_omega, central_ai, final_weapon
**기타:** training_dummy (연습용), scarecrow, rail_crawler

### 유물 이미지 (55종) ✅ 92%
STARTER 1, COMMON 12, UNCOMMON 12, RARE 10, BOSS 8, EVENT 6, SHOP 6 = 55종 완료.
보급품 연관 유물 5종만 미완료.

### 배경 (10종) ✅ 100%
전투 스테이지 3종, 맵 존 배경 3종, 씬 배경 4종 (맵, 모닥불, 이벤트, 상점)

### GUI 아이콘 (54종) ✅ 100%
카드 타입 7, 리소스 6, 의도 아이콘 6, 상태/디버프 4, 버프 9, HUD/UI 22

### 맵 뱃지 (7종) ✅ 100%
battle, elite, boss, campfire, event, shop, relic

### 플레이어+NPC (8종) ✅ 100%
player (idle, attack, physical_attack, physical_hit, special_attack, special_hit), merchant, scarecrow

### 앱 아이콘 (4종) ✅ 100%
icon.png, icon-256.png, icon-1024.png, icon.ico

### 폰트 (2종) ✅ 100%
Galmuri11.woff2, Galmuri11-Bold.woff2
