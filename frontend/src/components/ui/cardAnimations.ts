// 카드 이동 애니메이션 — 모듈 레벨 큐 (VFX 디스패처와 동일 패턴)

export type CardAnimType = 'DRAW' | 'DISCARD' | 'EXHAUST';

export interface CardAnim {
  id: string;
  type: CardAnimType;
  cardName: string;
  cardColor: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;    // ms 후 시작
  duration: number;  // 이동 시간 ms
}

const queue: CardAnim[] = [];
let listeners: (() => void)[] = [];
let nextId = 0;

function notify() {
  for (const fn of listeners) fn();
}

export function dispatchCardAnim(anim: Omit<CardAnim, 'id'>) {
  queue.push({ ...anim, id: `ca-${nextId++}` });
  notify();
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => { listeners = listeners.filter(l => l !== listener); };
}

export function consumeAnims(): CardAnim[] {
  if (queue.length === 0) return [];
  return queue.splice(0, queue.length);
}

// 뽑을 덱 / 버린 덱 화면 좌표 헬퍼
export function getDrawPilePos() {
  return { x: 60, y: window.innerHeight - 55 };
}

export function getDiscardPilePos() {
  return { x: window.innerWidth - 120, y: window.innerHeight - 55 };
}

export function getHandCenterPos() {
  return { x: window.innerWidth / 2, y: window.innerHeight - 40 };
}

// 카드 타입 → 색상 매핑
export function cardTypeToColor(type: string): string {
  if (type === 'PHYSICAL_ATTACK') return '#8b3a3a';
  if (type === 'SPECIAL_ATTACK') return '#5b3a8b';
  if (type === 'PHYSICAL_DEFENSE') return '#2a4a6a';
  if (type === 'SPECIAL_DEFENSE') return '#3a2a6a';
  if (type === 'UTILITY') return '#4a4a2a';
  if (type.startsWith('STATUS_')) return '#4a1a2a';
  return '#3a3a3a';
}
