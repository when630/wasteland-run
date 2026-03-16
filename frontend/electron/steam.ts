/**
 * Steam SDK 연동 모듈
 *
 * Phase 2에서 구현 예정.
 * steamworks.js 패키지 설치 후 활성화:
 *   npm install steamworks.js
 *
 * 사용 전 필요사항:
 * - Steamworks 파트너 계정 등록
 * - steam_appid.txt 파일에 실제 App ID 입력
 * - Steam 클라이언트가 실행 중이어야 함
 */

// import steamworks from 'steamworks.js';

let initialized = false;

// ── Steam 초기화 ──

export function initSteam(): boolean {
  if (initialized) return true;
  try {
    // const client = steamworks.init(480); // 480 = Spacewar (테스트용). 실제 App ID로 교체
    // initialized = true;
    // console.log('Steam SDK 초기화 성공');
    // return true;
    console.log('Steam SDK 미설치 — 오프라인 모드로 동작');
    return false;
  } catch (e) {
    console.error('Steam SDK 초기화 실패:', e);
    return false;
  }
}

// ── Steam 업적 ──

export const ACHIEVEMENTS = {
  FIRST_VICTORY: 'ACH_FIRST_VICTORY',       // 첫 전투 승리
  CHAPTER1_CLEAR: 'ACH_CHAPTER1_CLEAR',     // 챕터 1 클리어
  CHAPTER2_CLEAR: 'ACH_CHAPTER2_CLEAR',     // 챕터 2 클리어
  CHAPTER3_CLEAR: 'ACH_CHAPTER3_CLEAR',     // 챕터 3 완전 클리어
  KILL_100: 'ACH_KILL_100',                 // 적 100마리 처치 (누적)
  KILL_500: 'ACH_KILL_500',                 // 적 500마리 처치 (누적)
  GOLD_1000: 'ACH_GOLD_1000',              // 골드 1000 획득 (누적)
  NO_DAMAGE_BOSS: 'ACH_NO_DAMAGE_BOSS',    // 보스전 무피해 클리어
  FULL_RELIC: 'ACH_FULL_RELIC',             // 유물 5개 이상 보유
} as const;

export function unlockAchievement(_achievementId: string): void {
  if (!initialized) return;
  // steamworks.achievement.activate(achievementId);
}

// ── Steam 리더보드 ──

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

export async function submitScore(_score: number): Promise<void> {
  if (!initialized) return;
  // const leaderboard = await steamworks.leaderboard.findLeaderboard('Highscores');
  // await leaderboard.uploadScore(score);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!initialized) return [];
  // const leaderboard = await steamworks.leaderboard.findLeaderboard('Highscores');
  // const entries = await leaderboard.getScores(0, 100);
  // return entries.map((e, i) => ({ rank: i + 1, username: e.steamId, score: e.score }));
  return [];
}

// ── Steam 클라우드 세이브 ──

export function getCloudSavePath(): string | null {
  if (!initialized) return null;
  // Steam 클라우드는 Steamworks 웹 설정에서 디렉토리 지정
  // game-data/ 폴더를 클라우드 동기화 대상으로 설정하면 자동 동작
  return null;
}
