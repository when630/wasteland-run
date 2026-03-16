# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wasteland Run is a 2D side-view deck-building roguelike RPG, inspired by Slay the Spire. Post-apocalyptic wasteland theme with retro pixel art. Player on the left, enemies on the right, turn-based card combat with a dual-resource system (AP + Ammo) and 5 card types (Physical Attack, Special Attack, Physical Defense, Special Defense, Utility).

**Steam PC 전용 데스크탑 앱** — Electron으로 배포. 백엔드 서버 없이 로컬 오프라인 동작.

## Build & Run Commands

```bash
cd frontend
npm run dev              # Vite dev server (브라우저 테스트용)
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint
npm run test             # Vitest (72 cases)
npm run electron:dev     # Electron + Vite HMR (데스크탑 앱 개발)
npm run electron:build   # 프로덕션 빌드 + 인스톨러 생성
npm run electron:preview # 프로덕션 빌드 미리보기
```

## Architecture

### Electron Desktop App
- **Main Process** (`electron/main.ts`) — BrowserWindow 생성, IPC 핸들러, 풀스크린 토글, 창 상태 저장
- **Preload** (`electron/preload.ts`) — contextBridge로 electronAPI 노출
- **Storage** (`electron/storage.ts`) — userData 디렉토리에 JSON 파일 저장/로드
- **Steam** (`electron/steam.ts`) — Steam SDK 연동 (Phase 2)
- **Config** — `electron.vite.config.ts` (빌드), `electron-builder.yml` (패키징)

### Hybrid Rendering (React + Pixi.js)
- **React** (`src/components/ui/`) handles all standard UI: HUD, card hand, modals, map, menus
- **Pixi.js** (`src/components/pixi/`) handles WebGL canvas rendering: battle stage, enemy sprites, animations, effects
- **Zustand stores** (`src/store/`) are the single source of truth

Flow: User clicks card (React) -> Zustand store updates -> Pixi.js canvas plays attack animation.

### Frontend Structure (`frontend/src/`)
- `pages/` — View-level components: BattleView, MapView, RestView, EventView, ShopView, MainMenuView
- `components/ui/` — React UI components (Card rendering, HUD, modals)
- `components/pixi/` — Pixi.js canvas components (BattleStage, AnimatedEnemy)
- `store/` — Zustand stores: useBattleStore, useDeckStore, useRunStore, useMapStore, useAuthStore, useAudioStore
- `hooks/` — Business logic hooks (useCardPlay handles card cost validation, resource consumption, damage application)
- `types/` — TypeScript interfaces: gameTypes, enemyTypes, eventTypes, relicTypes
- `api/platform.ts` — Electron IPC 래퍼 (세이브/로드/통계/리더보드)
- `utils/` — Helpers (rng.ts for seeded RNG)

### Scene Management
`App.tsx` uses a `currentScene` state from `useRunStore` (not React Router) to switch between views: MAIN_MENU, MAP, BATTLE, ELITE, BOSS, REST, EVENT, SHOP, STARTING_EVENT, DEBUG_BATTLE.

### Data Persistence (로컬 오프라인)
- **세이브/로드**: `window.electronAPI.saveRun()` / `loadRun()` → `%AppData%/wasteland-run/game-data/run-save.json`
- **누적 통계**: `platformSubmitStats()` → `stats.json` (로컬 누적 집계)
- **설정**: `saveSettings()` / `loadSettings()` → `settings.json` (볼륨 등)
- **명예의 전당**: Phase 2에서 Steam Leaderboards API로 연결 예정

## Game Design References
Design documents live in `docs/plan/`: GDD.md (game overview), basic_card.md, basic_monster&boss.md, relics.md, map.md, events.md, uiux.md. Do not change game data (card costs, monster stats, etc.) without user approval.

## Conventions
- All game state goes through Zustand stores, never component-local state for game logic
- All game data structures (cards, relics, enemies) must have TypeScript types defined in `src/types/`
- Work logs go in `docs/logs/` as `YYYY-MM-DD_description.md`
- Project language: Korean in docs/comments, English in code identifiers
- Debug menus hidden in production via `import.meta.env.DEV`
