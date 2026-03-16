// ── Electron IPC API 타입 선언 ──

export interface ElectronAPI {
  saveRun: (data: unknown) => Promise<{ success: boolean }>;
  loadRun: () => Promise<unknown | null>;
  deleteRun: () => Promise<{ success: boolean }>;
  saveStats: (data: unknown) => Promise<{ success: boolean }>;
  loadStats: () => Promise<unknown | null>;
  saveSettings: (data: unknown) => Promise<{ success: boolean }>;
  loadSettings: () => Promise<unknown | null>;
  toggleFullscreen: () => Promise<boolean>;
  platform: 'electron';
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// ── 런 세이브/로드 ──

export async function platformSaveRun(data: Record<string, unknown>): Promise<void> {
  await window.electronAPI.saveRun(data);
}

export async function platformLoadRun(): Promise<Record<string, any> | null> {
  return (await window.electronAPI.loadRun()) as Record<string, any> | null;
}

// ── 통계: 로컬 누적 ──

interface LocalStats {
  totalRuns: number;
  totalClears: number;
  highestFloor: number;
  totalKills: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalCardsPlayed: number;
  totalGoldEarned: number;
  cardUsageMap: Record<string, number>;
  relicUsageMap: Record<string, number>;
}

function accumulateStats(
  existing: LocalStats | null,
  run: Record<string, any>,
): LocalStats {
  const base: LocalStats = existing || {
    totalRuns: 0, totalClears: 0, highestFloor: 0,
    totalKills: 0, totalDamageDealt: 0, totalDamageTaken: 0,
    totalCardsPlayed: 0, totalGoldEarned: 0,
    cardUsageMap: {}, relicUsageMap: {},
  };

  const cardUsageMap = { ...base.cardUsageMap };
  for (const [k, v] of Object.entries((run.cardUsageMap as Record<string, number>) || {})) {
    cardUsageMap[k] = (cardUsageMap[k] || 0) + v;
  }

  const relicUsageMap = { ...base.relicUsageMap };
  for (const [k, v] of Object.entries((run.relicUsageMap as Record<string, number>) || {})) {
    relicUsageMap[k] = (relicUsageMap[k] || 0) + v;
  }

  return {
    totalRuns: base.totalRuns + 1,
    totalClears: base.totalClears + (run.cleared ? 1 : 0),
    highestFloor: Math.max(base.highestFloor, (run.reachedFloor as number) || 0),
    totalKills: base.totalKills + ((run.enemiesKilled as number) || 0),
    totalDamageDealt: base.totalDamageDealt + ((run.damageDealt as number) || 0),
    totalDamageTaken: base.totalDamageTaken + ((run.damageTaken as number) || 0),
    totalCardsPlayed: base.totalCardsPlayed + ((run.cardsPlayed as number) || 0),
    totalGoldEarned: base.totalGoldEarned + ((run.goldEarned as number) || 0),
    cardUsageMap,
    relicUsageMap,
  };
}

function formatStatsForDisplay(stats: LocalStats): Record<string, any> {
  let favoriteCard: string | null = null;
  let favoriteCardCount = 0;
  for (const [card, count] of Object.entries(stats.cardUsageMap)) {
    if (count > favoriteCardCount) {
      favoriteCard = card;
      favoriteCardCount = count;
    }
  }

  let favoriteRelic: string | null = null;
  let favoriteRelicCount = 0;
  for (const [relic, count] of Object.entries(stats.relicUsageMap)) {
    if (count > favoriteRelicCount) {
      favoriteRelic = relic;
      favoriteRelicCount = count;
    }
  }

  return {
    totalRuns: stats.totalRuns,
    totalClears: stats.totalClears,
    highestFloor: stats.highestFloor,
    totalKills: stats.totalKills,
    totalDamageDealt: stats.totalDamageDealt,
    totalDamageTaken: stats.totalDamageTaken,
    totalCardsPlayed: stats.totalCardsPlayed,
    totalGoldEarned: stats.totalGoldEarned,
    favoriteCard,
    favoriteCardCount,
    favoriteRelic,
    favoriteRelicCount,
  };
}

export async function platformSubmitStats(payload: Record<string, any>): Promise<void> {
  const existing = (await window.electronAPI.loadStats()) as LocalStats | null;
  const merged = accumulateStats(existing, payload);
  await window.electronAPI.saveStats(merged);
}

export async function platformLoadStats(): Promise<Record<string, any> | null> {
  const raw = (await window.electronAPI.loadStats()) as LocalStats | null;
  if (!raw) return null;
  return formatStatsForDisplay(raw);
}

// ── 리더보드: Phase 2에서 Steam Leaderboards로 대체 예정 ──

export async function platformSubmitLeaderboard(_data: Record<string, unknown>): Promise<void> {
  // Phase 2: Steam Leaderboards
}

export async function platformLoadLeaderboard(): Promise<any[]> {
  // Phase 2: Steam Leaderboards
  return [];
}
