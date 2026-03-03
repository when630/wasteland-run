📦 src
 ┣ 📂 assets           # 정적 리소스 (Pixi.js에서 로드할 파일들)
 ┃ ┣ 📂 images         # 픽셀 아트 스프라이트 시트 (캐릭터, 몬스터, 배경)
 ┃ ┣ 📂 sounds         # BGM, 타격음, UI 효과음
 ┃ ┗ 📂 data           # JSON 형태의 정적 데이터 (카드 스펙, 적 패턴 등)
 ┃
 ┣ 📂 components       # 화면에 그려지는 요소들 (가장 중요한 폴더!)
 ┃ ┣ 📂 ui             # 순수 React 컴포넌트 (HTML/CSS 기반)
 ┃ ┃ ┣ 📜 Card.tsx       # 손패에 들어오는 카드 UI
 ┃ ┃ ┣ 📜 Hand.tsx       # 하단 카드 정렬 영역
 ┃ ┃ ┣ 📜 HUD.tsx        # 상단 HP, AP, 탄약, 방어도 표시줄
 ┃ ┃ ┗ 📜 Map.tsx        # 분기형 노드 맵 화면
 ┃ ┃
 ┃ ┗ 📂 pixi           # WebGL 캔버스 렌더링 컴포넌트 (@inlet/react-pixi 활용)
 ┃   ┣ 📜 BattleStage.tsx  # Pixi 캔버스의 최상위 컨테이너
 ┃   ┣ 📜 PlayerSprite.tsx # 주인공 대기/공격/피격 애니메이션
 ┃   ┣ 📜 EnemySprite.tsx  # 적 애니메이션 및 의도(Intent) 아이콘 렌더링
 ┃   ┗ 📜 Effect.tsx       # 총격, 타격, 폭발 등 파티클 이펙트
 ┃
 ┣ 📂 store            # 전역 상태 관리 (Zustand)
 ┃ ┣ 📜 useBattleStore.ts  # 전투 내 상태 (현재 AP, 탄약, 턴, 적 HP)
 ┃ ┣ 📜 useDeckStore.ts    # 덱 빌딩 상태 (전체 덱, 뽑은 카드, 버린 카드)
 ┃ ┗ 📜 useRunStore.ts     # 게임 전체 진행도 (현재 층수, 보유 골드, 유물, 맵 노드)
 ┃
 ┣ 📂 hooks            # 커스텀 훅 (복잡한 비즈니스 로직 분리)
 ┃ ┣ 📜 useCardPlay.ts     # 카드를 냈을 때 데미지 계산 및 자원 소모 로직
 ┃ ┗ 📜 useEnemyTurn.ts    # 턴 종료 시 적의 패턴 AI 실행 로직
 ┃
 ┣ 📂 services         # 백엔드(Spring) API 통신 (Axios)
 ┃ ┣ 📜 authService.ts     # 로그인, 인증 토큰 관리
 ┃ ┗ 📜 gameService.ts     # 전투 결과 저장, 리더보드 점수 전송
 ┃
 ┣ 📂 types            # TypeScript 인터페이스 (타입 정의)
 ┃ ┗ 📜 gameTypes.ts       # Card, Enemy, Player, Relic 등에 대한 타입 모음
 ┃
 ┣ 📂 utils            # 헬퍼 함수
 ┃ ┗ 📜 rng.ts             # 로그라이크용 시드 기반 난수 생성기 (결과 조작 방지)
 ┃
 ┣ 📜 App.tsx          # 게임의 씬(메인 메뉴 -> 맵 -> 전투)을 전환하는 최상위 라우터
 ┗ 📜 index.tsx        # React 진입점