# 통계 기능 구현 계획

## 개요
게임의 통계 기능을 3단계로 구현합니다:
1. **1단계: 런 요약** — GameOverModal에 추가 통계 항목 표시
2. **2단계: 런 내 실시간 추적** — useRunStore에 카운터 추가 (카드 사용 수, 가한/받은 피해, 획득 골드)
3. **3단계: 누적 통계** — 백엔드에 UserStats 테이블 + 프론트엔드 StatisticsModal UI

## 추적할 통계 항목

### 런 단위 (프론트엔드 useRunStore에 추가)

| 항목 | 필드명 | 기존/신규 |
|------|--------|-----------|
| 처치한 적 수 | enemiesKilled | 기존 |
| 도달 층수 | currentFloor (MapStore) | 기존 |
| 남은 골드 | gold | 기존 |
| 사용한 카드 수 | cardsPlayed | 신규 |
| 가한 총 피해 | totalDamageDealt | 신규 |
| 받은 총 피해 | totalDamageTaken | 신규 |
| 획득 총 골드 | totalGoldEarned | 신규 |
| 플레이 시간 | runStartTime 기반 계산 | 기존 |

### 누적 통계 (백엔드 UserStats 테이블)

| 항목 | 컬럼명 |
|------|--------|
| 총 런 횟수 | totalRuns |
| 총 클리어 횟수 | totalClears |
| 최고 도달 층 | highestFloor |
| 총 처치 수 | totalKills |
| 총 가한 피해 | totalDamageDealt |
| 총 받은 피해 | totalDamageTaken |
| 총 카드 사용 | totalCardsPlayed |
| 총 획득 골드 | totalGoldEarned |
| 가장 많이 사용한 카드 | favoriteCard |
| 가장 많이 획득한 유물 | favoriteRelic |

## 변경 파일

### 프론트엔드

- **[MODIFY] useRunStore.ts** — cardsPlayed, totalDamageDealt, totalDamageTaken, totalGoldEarned 상태 추가, 각각의 증가 액션 함수 추가, saveRunData/loadRunData에 신규 필드 반영, 런 종료 시 submitRunStats() 호출하여 백엔드에 런 통계 전송
- **[MODIFY] useCardPlay.ts** — 카드 사용 성공 시 addCardsPlayed(1) 호출, 데미지 적용 시 addDamageDealt(amount) 호출
- **[MODIFY] useBattleStore.ts** — 적 공격으로 플레이어에 데미지 적용 시 addDamageTaken(amount) 호출
- **[MODIFY] GameOverModal.tsx** — 플레이 시간, 사용한 카드 수, 가한/받은 피해, 획득 골드를 런 요약에 추가, 런 종료 시 submitRunStats() API 호출
- **[NEW] StatisticsModal.tsx** — 메인 메뉴에서 접근 가능한 누적 통계 모달, 백엔드 /api/stats API로 데이터 조회, 전체 플레이 기록/TOP 카드/유물 표시
- **[MODIFY] MainMenuView.tsx** — "통계" 버튼 클릭 시 StatisticsModal 열기 (기존 stub 교체)

### 백엔드

- **[NEW] entity/UserStats.java** — user_stats 테이블: 유저별 1:1 누적 통계 레코드
- **[NEW] dto/UserStatsDto.java** — 프론트로 전달할 응답 DTO
- **[NEW] dto/RunStatsSubmitDto.java** — 런 종료 시 프론트에서 보내는 런 통계 DTO
- **[NEW] repository/UserStatsRepository.java**
- **[NEW] service/UserStatsService.java** — submitRunStats(): 런 종료 시 해당 유저의 누적 통계에 병합, getUserStats(): 유저의 누적 통계 조회
- **[NEW] controller/UserStatsController.java** — POST /api/stats/submit (런 통계 제출), GET /api/stats (누적 통계 조회)
- **[MODIFY] SecurityConfig.java** — /api/stats/** 엔드포인트 인증 설정

## 검증 계획

### 자동 검증
- 백엔드: `./gradlew build` 정상 빌드
- 프론트엔드: `npx vite build` 정상 빌드

### 수동 검증
- 전투에서 카드 사용 → GameOverModal에서 사용한 카드 수, 가한/받은 피해 확인
- 런 종료 후 메인 메뉴 → 통계 버튼 → StatisticsModal에 누적 데이터 확인
- 두 번째 런 시작/종료 후 → 누적 수치 증가 확인
