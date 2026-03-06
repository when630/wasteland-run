# Wasteland Run 코드베이스 감사 리포트

> 작성일: 2026-03-06

---

## 1. 게임플레이 영향 (즉시 수정 필요)

### 1.1 전투 간 탄약 리셋 누락
- **파일:** `frontend/src/store/useBattleStore.ts` (resetBattle, line 65-82)
- **내용:** `resetBattle()`에 `playerAmmo: 0`이 없어서 이전 전투의 탄약이 다음 전투로 그대로 넘어감
- **심각도:** Critical

### 1.2 즐겨찾기 카드/유물 누적 로직 결함
- **파일:** `backend/.../stats/entity/UserStats.java` (updateFavoriteCard, line 78-90)
- **내용:** 누적 집계가 아닌 단일 런의 카운트로만 비교. 이번 런에서 카드를 1회 사용해도 역대 최다 사용 카드(count 기준)를 덮어쓸 수 있음
- **심각도:** High

### 1.3 런 재개 시 런 내 통계 초기화
- **파일:** `frontend/src/store/useRunStore.ts` (saveRunData/loadRunData)
- **내용:** `saveRunData`가 통계 필드를 전송하지만 `RunData` 엔티티에 해당 컬럼이 없어서 저장되지 않음. 런 재개 시 `cardsPlayed`, `totalDamageDealt` 등이 0으로 리셋됨
- **심각도:** High

---

## 2. 프론트엔드 이슈

### 2.1 불필요한 `as any` 타입 캐스팅
- **파일:** `frontend/src/store/useBattleStore.ts` (line 234)
- **내용:** `(runStore as any).runStartTime` — `RunState`에 `runStartTime`이 이미 정의되어 있으므로 캐스팅 불필요

### 2.2 `loadRunData` 반복 호출
- **파일:** `frontend/src/App.tsx` (line 69-73)
- **내용:** Zustand의 `loadRunData` 함수가 매 렌더마다 새 참조를 생성 → `useEffect` 의존성 배열에 포함되어 불필요하게 재실행

### 2.3 `saveRunData` await 누락
- **파일:** `frontend/src/pages/MapView.tsx` (line 41)
- **내용:** 노드 클릭 시 `saveRunData()` 반환값을 await하지 않음. 저장 실패 시 진행 데이터 유실 가능

### 2.4 BattleStage 타이머 누수
- **파일:** `frontend/src/components/pixi/BattleStage.tsx` (line 133-157)
- **내용:** 히트 애니메이션의 `setInterval`이 `timersRef`에 등록되지 않아 컴포넌트 언마운트 시 정리되지 않음

### 2.5 타겟팅 판별 로직 중복
- **파일:** `frontend/src/hooks/useCardPlay.ts` (line 56-60) + `frontend/src/components/ui/Hand.tsx` (line 30-34)
- **내용:** `needsEnemyTarget` 계산 로직이 두 곳에 복사되어 있어 카드 효과 변경 시 양쪽 모두 수정 필요

### 2.6 HUD 내 `any` 타입 사용
- **파일:** `frontend/src/components/ui/HUD.tsx` (line 234)
- **내용:** `RELICS.find((r: any) => ...)` — RELICS 배열은 이미 타입이 정의되어 있으므로 `any` 불필요

### 2.7 AuthModal 에러 타입 미지정
- **파일:** `frontend/src/components/ui/AuthModal.tsx` (line 39)
- **내용:** `catch (error: any)` — `AxiosError` 등 구체 타입 사용 권장

### 2.8 AudioContext/HTMLAudioElement 미정리
- **파일:** `frontend/src/store/useAudioStore.ts` (line 30-82)
- **내용:** `AudioContext`가 생성 후 해제되지 않고, BGM용 `HTMLAudioElement`도 누적됨. 장시간 플레이 시 메모리 누수

### 2.9 eslint-disable로 의존성 경고 무시
- **파일:** `frontend/src/pages/BattleView.tsx` (line 71), `frontend/src/pages/ShopView.tsx` (line 71)
- **내용:** 빈 의존성 배열 + eslint-disable. 의도적이지만 리팩토링 시 버그 유발 가능

---

## 3. 백엔드 이슈

### 3.1 H2 콘솔 무방비 노출
- **파일:** `backend/src/main/resources/application.yml` (line 14-19) + `backend/.../global/config/SecurityConfig.java` (line 47)
- **내용:** `web-allow-others: true` + `permitAll()` 조합으로 프로덕션에서 DB 직접 접근 가능
- **심각도:** Critical

### 3.2 JWT 시크릿 하드코딩
- **파일:** `backend/src/main/resources/application.yml` (line 24)
- **내용:** 순차적 문자열(`a1b2c3d4...`)이 소스코드에 노출. 환경변수로 분리 필요
- **심각도:** Critical

### 3.3 JWT 만료 시간 24시간 (임시 설정 방치)
- **파일:** `backend/.../global/security/jwt/JwtProvider.java` (line 25)
- **내용:** "임시 테스트용" 주석이 달려 있으나 그대로 유지 중. 리프레시 토큰 미구현

### 3.4 `@EnableJpaAuditing` 누락
- **파일:** `backend/.../WastelandRunBackendApplication.java`
- **내용:** `BaseTimeEntity`의 `@CreatedDate`/`@LastModifiedDate`가 동작하지 않음
- **심각도:** High

### 3.5 리더보드 N+1 쿼리
- **파일:** `backend/.../leaderboard/repository/LeaderboardRepository.java` (line 11)
- **내용:** `LAZY` 페칭된 User를 DTO 생성 시 개별 접근 → 유저 수만큼 추가 쿼리 발생. `@EntityGraph` 또는 JOIN FETCH 필요

### 3.6 User 관계 Cascade 미설정
- **파일:** `UserStats.java`, `Leaderboard.java`, `RunData.java` (각 엔티티의 User 관계)
- **내용:** User 삭제 시 연관 레코드가 고아로 잔존. `CascadeType.REMOVE` 추가 필요

### 3.7 컨트롤러 POST 엔드포인트 `@Valid` 누락
- **파일:** `UserStatsController.java` (line 19), `LeaderboardController.java` (line 21), `RunController.java` (line 27)
- **내용:** DTO에 검증 어노테이션이 있어도 `@Valid` 없이는 실행되지 않음

### 3.8 DTO 검증 어노테이션 부재
- **파일:** `RunStatsSubmitDto.java`, `LeaderboardSubmitDto.java`, `RunSaveRequestDto.java`
- **내용:** 수치 필드에 `@Min`, `@PositiveOrZero` 등 미적용. 음수/비정상 값 제출 가능

### 3.9 글로벌 예외 핸들러 미구현
- **파일:** 전체 컨트롤러
- **내용:** `@ControllerAdvice` 없음. 예외 발생 시 응답 형식 불일치, 스택 트레이스 노출 위험

### 3.10 JWT 검증에 `System.out.println` 사용
- **파일:** `backend/.../global/security/jwt/JwtProvider.java` (line 74)
- **내용:** SLF4J/Logback 대신 표준 출력 사용. 로그 레벨 관리 불가

### 3.11 JWT 빈 권한 파싱 오류
- **파일:** `backend/.../global/security/jwt/JwtProvider.java` (line 60-63)
- **내용:** auth 클레임이 빈 문자열일 때 `split(",")`이 `[""]`을 반환하여 잘못된 authority 생성

### 3.12 POST 응답 상태 코드
- **파일:** 모든 POST 엔드포인트
- **내용:** 리소스 생성 시 `200 OK` + 문자열 반환. `201 Created` + JSON이 적절

### 3.13 리더보드 중복 제출 방지 없음
- **파일:** `backend/.../leaderboard/service/LeaderboardService.java` (line 23-36)
- **내용:** 동일 런에 대해 무제한 점수 제출 가능

---

## 4. FE-BE 데이터 정합성

### 4.1 RunSaveRequestDto 유령 필드
- **FE:** `useRunStore.ts` saveRunData에서 `cardsPlayed`, `totalDamageDealt`, `totalDamageTaken`, `totalGoldEarned` 전송
- **BE:** `RunData` 엔티티에 해당 컬럼 없음. `RunService`에서 무시됨
- **해결:** DTO에서 제거하거나, `RunData` 엔티티에 컬럼 추가

### 4.2 RunResponseDto 통계 필드 누락
- **FE:** `loadRunData`에서 `data.cardsPlayed || 0`으로 방어 처리
- **BE:** `RunResponseDto`에 해당 필드 없어서 항상 `undefined` → 0으로 초기화
- **영향:** 런 재개 시 런 내 통계가 리셋됨

---

## 수정 우선순위 제안

1. **즉시:** 탄약 리셋 버그 (1.1)
2. **긴급:** H2 콘솔 노출 (3.1), JWT 시크릿 분리 (3.2), `@EnableJpaAuditing` (3.4)
3. **높음:** 즐겨찾기 로직 (1.2), 런 통계 정합성 (1.3, 4.1, 4.2), N+1 쿼리 (3.5)
4. **중간:** 타입 안전성 (2.1, 2.6, 2.7), 타이머 누수 (2.4), `@Valid` (3.7), 예외 핸들러 (3.9)
5. **낮음:** 로깅 개선 (3.10), 응답 코드 (3.12), 중복 로직 (2.5)
