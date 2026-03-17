// VFX 타입 정의 — 순수 시각 레이어, Zustand 스토어와 무관

export type VfxCategory =
  // 플레이어 공격
  | 'HEAVY_KINETIC' | 'HIGH_RPM_FRICTION' | 'THERMAL_AOE' | 'ELECTROMAGNETIC'
  | 'BLADE_SLASH' | 'GROUND_POUND' | 'BERSERK' | 'SCATTER_SHOT'
  // 방어/유틸 카드
  | 'SHIELD_BARRIER' | 'RESIST_WARD' | 'BUFF_AURA' | 'FORTRESS'
  | 'HEAL_PULSE' | 'BLOOD_SACRIFICE' | 'POWER_SURGE' | 'PURIFY_BURST'
  // 적 공격
  | 'ENEMY_MELEE' | 'ENEMY_RANGED' | 'ENEMY_BUFF'
  // 상태이상 틱
  | 'STATUS_BURN' | 'STATUS_POISON'
  // 사망/반사
  | 'ENEMY_DEATH' | 'REFLECT';

export interface ShakeProfile {
  intensity: number;
  axis: 'X' | 'Y' | 'XY';
  durationMs: number;
  decayRate: number;
}

export interface VfxProfile {
  category: VfxCategory;
  color: number;
  hitStopMs: number;
  shakeProfile: ShakeProfile;
  isAoe: boolean;
  multiHitCount: number;
}

export type ParticleShape = 'RECT' | 'CIRCLE' | 'LINE';

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  friction: number;
  gravity: number;
  shape: ParticleShape;
  width: number;
  height: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: number;
  elapsed: number;
  duration: number;
}

export interface LineTrace {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  maxWidth: number;
  alpha: number;
  color: number;
  elapsed: number;
  duration: number;
}

export interface VfxCommand {
  cardBaseId: string;
  sourceX: number;
  sourceY: number;
  targetPositions: { x: number; y: number }[];
  hitIndex?: number;
}
