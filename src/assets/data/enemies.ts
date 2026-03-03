import { Enemy } from '../types/enemyTypes';
import { generateUniqueId } from '../utils/rng';

export const BASE_ENEMIES: Record<string, Omit<Enemy, 'id' | 'currentHp' | 'shield' | 'resist' | 'currentIntent'>> = {
  scrap_collector: {
    baseId: 'scrap_collector',
    name: '고철 수집가',
    maxHp: 45,
  },
  // TODO: 추후 녹슨 자동인형, 돌연변이 들개 등 추가
};

/**
 * 특정 baseId의 적을 생성하여 새 인스턴스화 하는 공용 함수
 */
export const createEnemy = (baseId: string): Enemy => {
  const baseDef = BASE_ENEMIES[baseId];
  if (!baseDef) throw new Error(`Enemy ${baseId} not found`);

  return {
    ...baseDef,
    id: generateUniqueId(),
    currentHp: baseDef.maxHp,
    shield: 0,
    resist: 0,
    currentIntent: {
      type: 'ATTACK',
      amount: 5,
      description: '물리 атака 5', // 초기 의도 하드코딩 (나중에 AI 스크립트 연결 시 동적화)
    }
  };
};
