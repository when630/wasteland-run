# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wasteland Run is a 2D side-view deck-building roguelike RPG (web-based), inspired by Slay the Spire. Post-apocalyptic wasteland theme with retro pixel art. Player on the left, enemies on the right, turn-based card combat with a dual-resource system (AP + Ammo) and 5 card types (Physical Attack, Special Attack, Physical Defense, Special Defense, Utility).

## Build & Run Commands

### Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm run dev      # Dev server with HMR
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Backend (Spring Boot + Gradle + Java 17)
```bash
cd backend
./gradlew bootRun          # Run server (port 8080)
./gradlew build            # Build
./gradlew test             # Run tests (JUnit 5)
```

Backend uses H2 in-memory database (no external DB setup needed). H2 console at `/h2-console`.

## Architecture

### Hybrid Rendering (React + Pixi.js)
The frontend uses a **hybrid rendering** approach:
- **React** (`src/components/ui/`) handles all standard UI: HUD, card hand, modals, map, menus
- **Pixi.js** (`src/components/pixi/`) handles WebGL canvas rendering: battle stage, enemy sprites, animations, effects
- **Zustand stores** (`src/store/`) are the single source of truth. Both React components and Pixi objects subscribe to stores — neither holds game logic in local state.

Flow: User clicks card (React) -> Zustand store updates -> Pixi.js canvas plays attack animation.

### Frontend Structure (`frontend/src/`)
- `pages/` — View-level components: BattleView, MapView, RestView, EventView, ShopView, MainMenuView
- `components/ui/` — React UI components (Card rendering, HUD, modals)
- `components/pixi/` — Pixi.js canvas components (BattleStage, AnimatedEnemy)
- `store/` — Zustand stores: useBattleStore (combat state), useDeckStore (deck/hand/discard), useRunStore (run progress, gold, relics, map), useMapStore, useAuthStore, useAudioStore
- `hooks/` — Business logic hooks (useCardPlay handles card cost validation, resource consumption, damage application)
- `types/` — TypeScript interfaces: gameTypes, enemyTypes, eventTypes, relicTypes
- `api/` — API client (auth)
- `utils/` — Helpers (rng.ts for seeded RNG)

### Scene Management
`App.tsx` uses a `currentScene` state from `useRunStore` (not React Router paths) to switch between views: MAIN_MENU, MAP, BATTLE, ELITE, BOSS, REST, EVENT, SHOP.

### Backend Structure (`backend/src/main/java/com/wasteland/backend/`)
- `domain/` — Feature modules (user, run, leaderboard, stats), each with controller/dto/entity/repository/service layers
- `global/config/` — Spring configuration
- `global/entity/` — Base entities
- `global/security/` — JWT auth, Spring Security config

Spring Boot 3.2.4, JWT auth (jjwt), Lombok, JPA with H2.

## Game Design References
Design documents live in `docs/plan/`: GDD.md (game overview), basic_card.md, basic_monster&boss.md, relics.md, map.md, events.md, uiux.md. Do not change game data (card costs, monster stats, etc.) without user approval.

## Conventions
- All game state goes through Zustand stores, never component-local state for game logic
- API calls use modularized Axios instances in `src/api/` or `src/services/`
- All game data structures (cards, relics, enemies) must have TypeScript types defined in `src/types/`
- Work logs go in `docs/logs/` as `YYYY-MM-DD_description.md`
- Project language: Korean in docs/comments, English in code identifiers
