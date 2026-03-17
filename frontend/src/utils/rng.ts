// src/utils/rng.ts

/**
 * Mulberry32 시드 기반 의사 난수 생성기 (PRNG)
 * 동일한 시드 → 동일한 난수 시퀀스를 보장합니다.
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /** 내부 상태 직렬화/복원 */
  getState(): number { return this.state; }
  setState(s: number): void { this.state = s; }

  /** 0 이상 1 미만의 부동소수점 난수 반환 */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** 0 이상 max 미만의 정수 반환 */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /** Fisher-Yates 셔플 (원본 훼손 없음) */
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/** 문자열을 숫자 시드로 변환 (DJB2 해시) */
export function hashString(s: string): number {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Fisher-Yates 알고리즘을 사용한 배열 셔플 함수
 * 원본 배열을 훼손하지 않고 섞인 새 배열을 반환합니다.
 * rng 파라미터가 주어지면 시드 기반 셔플, 없으면 Math.random 폴백.
 */
export function customShuffle<T>(array: T[], rng?: SeededRNG): T[] {
  if (rng) return rng.shuffle(array);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 고유한 ID를 생성하는 유틸리티.
 * 카운터 기반으로 고유성을 보장합니다 (시드 RNG 불필요).
 */
let idCounter = 0;
export function generateUniqueId(): string {
  return `${Date.now().toString(36)}_${(++idCounter).toString(36)}`;
}
