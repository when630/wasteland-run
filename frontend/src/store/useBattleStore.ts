import { create } from 'zustand';
import type { BattleState } from './battle/types';
import { createPlayerSlice } from './battle/playerSlice';
import { createEnemySlice } from './battle/enemySlice';
import { createBattleFlowSlice } from './battle/battleFlowSlice';

export type { DamageType } from '../types/enemyTypes';

export const useBattleStore = create<BattleState>((...a) => ({
  ...createPlayerSlice(...a),
  ...createEnemySlice(...a),
  ...createBattleFlowSlice(...a),
}));
