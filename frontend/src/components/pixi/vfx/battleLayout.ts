// 전투 캔버스 레이아웃 상수 — BattleStage와 useCardPlay에서 공유

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export const PLAYER_POS = {
  x: DESIGN_WIDTH * 0.25,
  y: DESIGN_HEIGHT * 0.65,
};

export function enemyPos(index: number) {
  return {
    x: DESIGN_WIDTH * (0.6 + index * 0.18),
    y: DESIGN_HEIGHT * 0.65,
  };
}
