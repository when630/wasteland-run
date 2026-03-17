# 미제작 에셋 목록

> 최종 업데이트: 2026-03-17

---

## 요약

| 카테고리 | 전체 | 완료 | 미완료 | 완성도 |
|----------|------|------|--------|--------|
| 적 스프라이트 (idle/attack/hit) | 33종 (99벌) | 29종 (87벌) | 14종 (42벌) | 88% |
| 유물 이미지 | 55종 | 13종 | 42종 | 24% |
| 배경 이미지 | 10종 | 10종 | 0 | 100% |
| GUI 아이콘 | 53종 | 53종 | 0 | 100% |
| 맵 노드 뱃지 | 7종 | 7종 | 0 | 100% |
| 플레이어+NPC 스프라이트 | 6종 | 6종 | 0 | 100% |
| 앱 아이콘 | 4종 | 4종 | 0 | 100% |
| 폰트 | 2종 | 2종 | 0 | 100% |
| 카드 아트 | 75장 | 0 | 75장 | 0% |
| BGM | ~8트랙 | 0 | ~8 | 0% |
| SFX | ~17종 | 0 | ~17 | 0% |

---

## 1. 적 스프라이트 (14종 미완료 — 42벌)

> 파일 규칙: `{baseId}.webp`, `{baseId}_attack.webp`, `{baseId}_hit.webp`
> 경로: `frontend/src/assets/images/characters/`
> 스프라이트 없는 적은 intent 패턴도 미구현 (fallback 사용중)

### 3막 일반 (8종 — 스프라이트 없음, intent 미구현)

| baseId | 이름 | tier | HP | 비주얼 힌트 |
|--------|------|------|----|-----------|
| security_drone | 기업 경비 드론 | NORMAL | 40 | 날개 달린 소형 드론, 레이저 포탑 |
| bio_experiment | 생체 실험체 | NORMAL | 55 | 배양액 묻은 변이 인간, 투명 피부 |
| corporate_guard | 기업 경비원 | NORMAL | 42 | 검은 방탄복, 바이저 헬멧, 곤봉 |
| nano_swarm | 나노 군집 | NORMAL | 30 | 미세 로봇 군집, 은빛 구름 형태 |
| cryo_sentinel | 냉동 감시자 | NORMAL | 50 | 서리 낀 로봇, 냉기 방출, 파란 눈 |
| hazmat_worker | 방호복 작업자 | NORMAL | 38 | 노란 방호복, 가스마스크, 화학 스프레이 |
| cleaning_drone | 방주 청소 드론 | NORMAL | 22 | 원형 청소 로봇, 레이저 장착 |
| experiment_x7 | 실험체 X-7 | NORMAL | 45 | 피부 투명 근육질 실험체, 붉은 코드번호 |

### 3막 엘리트 (3종)

| baseId | 이름 | tier | HP | 비주얼 힌트 |
|--------|------|------|----|-----------|
| chief_scientist | 수석 과학자 | ELITE | 110 | 백의 + 기계팔, 플라즈마 주사기 |
| war_machine | 전쟁 기계 | ELITE | 120 | 무한궤도 탱크형 로봇, 기관총+미사일 |
| prototype_fighter | 프로토타입 전투기 | ELITE | 100 | 미완성 전투 로봇, 한쪽 팔 미장착 |

### 3막 보스 (3종)

| baseId | 이름 | tier | HP | 비주얼 힌트 |
|--------|------|------|----|-----------|
| director_omega | 최종 지시자 오메가 | BOSS | 220 | 거대 기업 AI 본체, 모니터+케이블, 초기 방어도 30 |
| central_ai | AI 중앙통제 시스템 | BOSS | 180 | 서버랙 + 거대 모니터, 붉은 AI 얼굴, 초기 방어도 25 |
| final_weapon | 최종 병기 프로젝트 | BOSS | 250 | 거대 인형 무기, 미사일+포탑+검 일체형 |

---

## 2. 유물 이미지 (42종 미완료)

> 파일 규칙: `relic_{id}.webp` → `frontend/src/assets/images/relics/`
> 이미지 완료 13종: bloody_bandolier, old_medkit, old_sheriff_badge, glow_watch, scrap_parts_bracelet, cracked_brass_compass, alloy_plating, faded_family_photo, arc_heart, bionic_culture_heart, red_eye_surveillance_module, cracked_sunstone_reactor, burnt_operation_map

### STARTER (1종)

| id | 이름 | 현재 | 비주얼 힌트 |
|----|------|------|-----------|
| survivor_dog_tag | 황무지 생존자의 인식표 | 🏷️ | 찌그러진 금속 인식표, 체인에 매달림 |

### COMMON (9종)

| id | 이름 | 현재 | 비주얼 힌트 |
|----|------|------|-----------|
| rusty_knuckle | 녹슨 너클 | 🥊 | 녹슨 철 주먹장갑, 관절에 볼트 |
| makeshift_silencer | 즉석 소음기 | 🔫 | 페트병을 총구에 테이프로 감음 |
| lucky_casing | 행운의 탄피 | 📿 | 황동 탄피 여러 개 꿰어 만든 목걸이 |
| emergency_bandage | 응급 붕대 | 🩹 | 피 묻은 거즈 롤 |
| steel_helmet | 철모 | 🪖 | 탄흔 있는 녹슨 군용 헬멧 |
| makeshift_trap | 즉석 함정 | 🪤 | 철사와 캔으로 만든 트립와이어 |
| small_battery | 소형 배터리 | 🔋 | 반쯤 녹슨 AA 배터리 2개 테이프 묶음 |
| relief_crate | 구호물자 상자 | 📦 | UN 스타일 흰색 상자, 먼지 덮임 |
| auto_loader | 자동 장전기 | 🔩 | 스프링 달린 금속 장치 |

### UNCOMMON (9종)

| id | 이름 | 현재 | 비주얼 힌트 |
|----|------|------|-----------|
| spiked_pauldron | 가시 어깨받이 | 🦔 | 못 박힌 가죽 어깨 패드 |
| regen_salve | 재생 연고 | 💊 | 형광 녹색 연고 유리병 |
| scrap_collector_relic | 잔해 수집기 | ♻️ | 허리 자석 벨트, 철 파편 붙음 |
| skull_charm | 해골 부적 | 💀 | 작은 동물 두개골 + 빨간 실 |
| scope | 조준경 | 🎯 | 깨진 라이플 스코프 |
| reinforced_gloves | 강화 장갑 | 🧤 | 금속판 붙인 두꺼운 장갑 |
| lead_insert | 납판 삽입물 | 🛡️ | 납으로 만든 얇은 판, 조끼에 삽입 |
| hourglass | 모래시계 | ⏳ | 깨진 유리에 모래 흐르는 시계 |
| tactical_vest | 전술 조끼 | 🃏 | 주머니 많은 군용 조끼 |

### RARE (8종)

| id | 이름 | 현재 | 비주얼 힌트 |
|----|------|------|-----------|
| tactical_hud | 전술 HUD | 📡 | 한쪽 눈 모노클 디스플레이 |
| welding_gauntlet | 용접 장갑 | 🔥 | 용접기 내장 가죽 장갑, 불꽃 |
| magnetic_coil | 자기장 코일 | 🧲 | 팔뚝 구리 코일, 푸른 전류 |
| blood_regulator | 혈압 조절기 | 🌡️ | 팔에 감은 혈압계 + 튜브 |
| gambler_dice | 도박사의 주사위 | 🎰 | 이빨 빠진 구식 주사위 |
| ammo_magnet | 탄약 자석 | 🧲 | U자형 자석에 탄피 붙음 |
| perpetual_engine | 영구 운동 장치 | 🔄 | 쉬지 않고 도는 작은 기어 세트 |
| berserker_mark | 광전사의 문양 | 🩸 | 팔에 새긴 붉은 부족 문양 |

### BOSS (4종)

| id | 이름 | 현재 | 비주얼 힌트 |
|----|------|------|-----------|
| adrenaline_injector | 아드레날린 주입기 | 💉 | 팔에 테이프로 고정된 자동 주사기 |
| quantum_core | 양자 코어 | 🌀 | 보라색 빛 구체, 균열 에너지 |
| ancient_prosthetic | 고대 전투 보철 | ⛓️ | 금속 의수, 관절에서 증기 |
| unstable_teleporter | 불안정한 텔레포터 | 🔮 | 깜빡이는 파란 빛 손목 장치 |

### EVENT (5종)

| id | 이름 | 현재 | 비주얼 힌트 |
|----|------|------|-----------|
| mutant_claw | 돌연변이 발톱 | 🐾 | 형광 녹색 발톱 3개 |
| forgotten_manual | 잊혀진 기술서 | 📖 | 낡은 군용 매뉴얼, 테이프 수선 |
| ruin_charm | 폐허의 부적 | 🦴 | 뼈와 금속 조각으로 엮은 부적 |
| canned_food | 통조림 식량 | 🍖 | 라벨 벗겨진 군용 식량 캔 |
| prophecy_orb | 예언의 수정구 | 🔮 | 금 간 수정구, 안개 소용돌이 |

### SHOP (6종)

| id | 이름 | 현재 | 비주얼 힌트 |
|----|------|------|-----------|
| merchant_membership | 상인의 멤버십 | 💰 | 금속 멤버십 카드 |
| concentrated_heal | 농축 회복제 | 🧪 | 진한 빨간 액체 주사기 |
| precision_tools | 정밀 공구 | 📐 | 소형 정밀 드라이버 세트 |
| weapon_maintenance_kit | 화기 정비 키트 | 🧲 | 기름 묻은 천 + 청소봉 |
| universal_repair_tool | 만능 수리 도구 | 🔧 | 접이식 만능 공구 |
| large_ammo_case | 대형 탄약통 | 🎒 | 금속 탄약 상자, 잠금장치 |

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

## 5. 완료된 에셋

### 적 스프라이트 (29종 × 3벌 = 87파일)
**1막 (13종):** training_dummy, scrap_collector, acid_dog, waste_slime, radiation_spider, rust_marauder, scrap_turret, mutant_behemoth, rogue_sentry, mutant_sniper, brutus, rusted_watchbot, mutant_crows
**2막 (10종):** subway_rat, rail_crawler, mole_person, tunnel_spider, electric_slime, rusted_golem, derailed_conductor, shadow_lurker, track_guardian, leviathan_worm
**3막 보스+일반 (6종):** spider_queen, storm_generator, derailed_train, underground_lord, infected_passenger, glowing_moss

### 배경 (10종)
전투 스테이지 3종 (stage1~3_battle_backgroung.webp), 맵 존 4종 (map_background, zone1~3), 씬 배경 3종 (campfire, event, shop)

### GUI 아이콘 (53종)
카드 타입 7, 리소스 5, HUD 19, 카드 더미 4, 디버프/상태 8, 버프 7, 기타 3

### 맵 뱃지 (7종)
battle, elite, boss, campfire, event, shop, relic (보물방)

### 플레이어+NPC (6종)
player (idle, physical_attack, physical_hit, special_attack, special_hit) + merchant

### 앱 아이콘 (4종)
icon.png (512), icon-256.png, icon-1024.png, icon.ico → `frontend/resources/`

### 폰트 (2종)
Galmuri11.woff2, Galmuri11-Bold.woff2 → `frontend/src/assets/fonts/`
