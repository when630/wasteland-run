# Wasteland Run — 작업 보고서

**작업일**: 2026년 3월 6일  
**작업 범위**: 폴리싱, 버그 수정, 피격 모션 개선, UI 텍스트 리팩토링

---

## 1. 불완전 기능 폴리싱 (5건)

### 1-1. 휴식 회복 연출 추가
- **파일**: `frontend/src/pages/RestView.tsx`
- **변경 전**: 휴식 버튼 클릭 시 회복 후 즉시 맵으로 전환. 연출 없음.
- **변경 후**: `healResult` 상태를 추가하여 회복 결과 화면("회복 완료! +N HP")을 표시. "길을 떠난다" 버튼으로 맵 복귀.

### 1-2. "강화 (예정)" 텍스트 수정
- **파일**: `frontend/src/pages/RestView.tsx`
- **변경**: `강화 (예정)` → `강화`. 이미 `UpgradeCardModal`이 정상 작동하고 있었으므로 텍스트만 수정.

### 1-3. CardEffect 타입 확장
- **파일**: `frontend/src/types/gameTypes.ts`
- **변경**: `CardEffect` 인터페이스에 `statusType?: string`과 `duration?: number` 필드 추가. 기존 TODO 주석 제거.

### 1-4. 플레이어 상태이상 TODO 정리
- **파일**: `frontend/src/hooks/useCardPlay.ts`
- **변경**: `DEBUFF` 효과의 `target === 'PLAYER'` 분기에서 유저에게 보이던 "구현되지 않았습니다" 토스트를 제거하고 `console.log`로 전환.

### 1-5. 핸드 최대 10장 제한
- **파일**: `frontend/src/store/useDeckStore.ts`
- **변경**: `drawCards` 함수 내부에서 `newHand.length >= 10`이면 드로우 중단. TODO 주석 제거.

---

## 2. 피격 모션 개선 및 상태이상 전용 시각 효과

### 2-1. 적(Enemy) 시각 효과 확장

| 파일 | 변경 내용 |
|------|-----------|
| `frontend/src/types/enemyTypes.ts` | `visualEffect.type`에 `BURN_TICK`, `POISON_TICK`, `BURN_POISON_TICK` 추가 |
| `frontend/src/components/pixi/AnimatedEnemy.tsx` | 4종 이펙트 분기 처리 |

| 이펙트 | 변경 전 | 변경 후 |
|--------|---------|---------|
| 직접 공격 (DAMAGE) | 좌우 사인파 흔들기 + 흰색 | 넉백(뒤로 밀림→반동→원위치) + 붉은 번쩍 |
| 화상 틱 (BURN_TICK) | 없음 | 오렌지 맥동 + Y축 떨림 |
| 맹독 틱 (POISON_TICK) | 없음 | 녹색 빛 + 몸체 수축(92%→100%) |
| 복합 틱 (BURN_POISON_TICK) | 없음 | 80ms 간격 오렌지↔녹색 교차 + Y떨림 + 수축 |

### 2-2. 적 상태이상 데미지 시 이펙트 트리거
- **파일**: `frontend/src/store/useBattleStore.ts`
- `executeEnemyTurns` 내 BURN/POISON 처리 시, 해당 적에게 `visualEffect` 부여.
- 두 상태가 동시에 걸린 경우 `BURN_POISON_TICK` 복합 타입 사용.
- `visualEffect` 보존 필터를 `DAMAGE`만 해제하도록 수정 (BUFF, BURN_TICK 등은 보존).

### 2-3. 플레이어 피격 큐 타입 확장

| 파일 | 변경 내용 |
|------|-----------|
| `frontend/src/store/useBattleStore.ts` | `playerHitQueue: number` → `Array<{type: 'DAMAGE'\|'BURN'\|'POISON'}>` |
| `frontend/src/components/pixi/BattleStage.tsx` | 큐 타입별 분기 애니메이션 |

| 피격 타입 | 모션 |
|-----------|------|
| DAMAGE (직접 공격) | 넉백 + 붉은 번쩍 (300ms) |
| BURN (화상 공격) | 오렌지 점멸 + Y 떨림 (350ms) |
| POISON (독 공격) | 녹색 점멸 + 투명도 깜빡 (350ms) |

### 2-4. 적 공격 속성에 따른 플레이어 피격 타입 자동 분류
- **파일**: `frontend/src/store/useBattleStore.ts`
- 적의 공격 `description`을 분석하여 피격 타입 분기:
  - `☣️`/`산성`/`독` 키워드 → POISON
  - `소이탄`/`화상`/`화염` 키워드 → BURN
  - 그 외 → DAMAGE

### 2-5. 순차 피격 큐 처리 안정화
- **파일**: `frontend/src/components/pixi/BattleStage.tsx`
- `useState`(isAnimatingHit) → `useRef`(isAnimatingRef)로 전환하여 React 배칭에 의한 다중 히트 누락 방지.
- 모든 타이머를 추적하여 컴포넌트 언마운트 시 정리.

---

## 3. 카드 타겟팅 UX 개선

- **파일**: `frontend/src/hooks/useCardPlay.ts`
- **변경 전**: 전체 공격/버프/방어 등 단일 대상이 아닌 카드를 타겟팅 상태에서 적 위를 클릭하면 "이 카드는 플레이어 자신에게만 사용할 수 있습니다" 에러.
- **변경 후**: 단일 대상이 아닌 카드는 어디를 클릭해도(적, 플레이어, 빈 공간) 자동으로 `targetId`를 `'PLAYER'`로 변환하여 정상 발동.

---

## 4. 토스트 메시지 리팩토링

7개 파일에 걸쳐 25개 이상의 토스트 메시지를 일괄 수정.

### 원칙
- 모든 이모지 제거
- 간결하고 세련된 문구
- 황무지 세계관에 맞는 톤 통일

### 주요 변경

| 카테고리 | 변경 전 | 변경 후 |
|----------|---------|---------|
| 전투 | `아직 플레이어 턴이 아닙니다.` | `적의 차례입니다. 잠시 기다리세요.` |
| 전투 | `AP가 부족합니다! (필요: 2, 현재: 1)` | `AP 부족! (1/2)` |
| 전투 | `탄약이 없습니다! (필요: 1, 현재: 0)` | `탄약 부족! (0/1)` |
| 전투 | `이 카드는 적을 대상으로 지정해야 합니다.` | `타겟을 지정하세요 — 적을 클릭!` |
| 전투 | `카운터 적중! 추가 피해 +14` | `카운터! +14 추가 피해` |
| 전투 | `적 전체에 BURN 3 부여!` | `전체 BURN ×3!` |
| 전투 | `버프 획득: PURIFY_1 (효과 구현 중)` | `디버프 1개 정화!` |
| 상점 | `[낡은 쇠파이프] 카드를 구매했습니다.` | `낡은 쇠파이프 획득!` |
| 상점 | `[녹광 시계] 유물을 구매했습니다.` | `녹광 시계 획득!` |
| 상점 | `카드를 제거했습니다.` | `카드를 덱에서 제거했습니다.` |
| 유물 | `새로운 유물을 획득했습니다!` | `새로운 유물의 힘이 깨어납니다!` |
| 보스 | `오염물질 피격: 덱에 [화상] 카드가 섞여들어왔습니다!` | `오염물질 침투 — 덱에 [화상] 카드가 섞여들었다!` |
| 인증 | `환영합니다, user님!` | `user, 다시 돌아오셨군요.` |
| 인증 | `가입 성공! user님 환영합니다.` | `user, 황무지에 오신 것을 환영합니다.` |
| 인증 | `로그인에 실패했습니다.` | `인증 실패 — 다시 시도해주세요.` |
| 세이브 | `진행 상황을 불러왔습니다.` | `데이터 수신 완료 — 탐험을 이어갑니다.` |
| 메뉴 | `[통계] 기능은 개발 중입니다!` | `[통계] — 공사 중입니다` |

---

## 5. 커밋 이력

```
8942bc4 polish: remove all emojis from toasts, refine AuthModal messages
ba550fe polish: rewrite all toast messages to be more thematic and immersive
8aef559 fix: non-single-target cards now activate when clicking on enemies too
37f8104 fix: use useRef for hit animation lock to prevent React batching skip
f161845 feat: combined BURN+POISON visual effect with alternating colors
c5bcf3f fix: preserve BURN_TICK/POISON_TICK visualEffects on enemies
c1654b9 fix: player hit animation color now matches enemy attack type
bc50e73 feat: polish hit animations - knockback, burn, poison effects
b781aa3 polish: heal animation, card upgrade text, CardEffect, hand limit, debuff cleanup
```

---

## 6. 수정된 파일 목록

| 파일 | 수정 내용 |
|------|-----------|
| `frontend/src/pages/RestView.tsx` | 회복 연출, "강화" 텍스트 |
| `frontend/src/types/gameTypes.ts` | CardEffect 확장 |
| `frontend/src/types/enemyTypes.ts` | visualEffect 타입 확장 |
| `frontend/src/hooks/useCardPlay.ts` | 플레이어 디버프 TODO 정리, 카드 타겟팅, 토스트 메시지 |
| `frontend/src/store/useDeckStore.ts` | 핸드 10장 제한 |
| `frontend/src/store/useBattleStore.ts` | 피격 큐 타입화, 상태이상 VFX, 공격 속성 분류, 토스트 |
| `frontend/src/components/pixi/BattleStage.tsx` | 플레이어 피격 모션 (useRef 락, 타입별 분기) |
| `frontend/src/components/pixi/AnimatedEnemy.tsx` | 적 피격 모션 (넉백, 화상, 맹독, 복합) |
| `frontend/src/pages/ShopView.tsx` | 토스트 메시지 |
| `frontend/src/pages/MainMenuView.tsx` | 토스트 메시지 |
| `frontend/src/store/useRunStore.ts` | 토스트 메시지 |
| `frontend/src/components/ui/RelicRewardModal.tsx` | 토스트 메시지 |
| `frontend/src/components/ui/AuthModal.tsx` | 토스트 메시지 |
