// src/utils/rng.ts

/**
 * Fisher-Yates 알고리즘을 사용한 배열 셔플 함수
 * 원본 배열을 훼손하지 않고 섞인 새 배열을 반환합니다.
 * 추후 로그라이크 시드(Seed) 기반 난수 생성기로 교체하기 쉽게 모듈화 해둡니다.
 */
export function customShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 고유한 ID를 생성하는 유틸리티.
 * 덱 안에서 동일한 카드 객체(Reference)를 식별하기 위해 인스턴스 ID 발급 용도로 사용합니다.
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
