// 전투 캔버스 레이아웃 상수 — BattleStage와 useCardPlay에서 공유

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

/** 캐릭터 배치 Y 비율 — 화면 세로 기준 (0.65→0.55로 올려 카드 핸드와 겹침 방지) */
export const BATTLE_Y_RATIO = 0.55;

export const PLAYER_POS = {
  x: DESIGN_WIDTH * 0.25,
  y: DESIGN_HEIGHT * BATTLE_Y_RATIO,
};

/**
 * 적 위치 계산 — 적 수에 따라 우측 영역에 균등 배치
 * @param index 적 인덱스 (0부터)
 * @param total 총 적 수 (1~3)
 */
export function enemyPos(index: number, total: number = 1) {
  // 중심점과 적 간 간격으로 배치
  const CENTER = 0.72;   // 적 영역 중심 (화면 72%)
  const SPACING = 0.14;  // 적 사이 간격 (화면 14% = ~269px)

  const offset = index - (total - 1) / 2; // 중심 기준 오프셋 (-0.5, 0, 0.5 등)
  const x = DESIGN_WIDTH * (CENTER + offset * SPACING);

  return { x, y: DESIGN_HEIGHT * BATTLE_Y_RATIO };
}
