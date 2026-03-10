import type React from 'react';

/**
 * 반복되는 onMouseEnter/onMouseLeave backgroundColor 패턴 대체
 */
export function useHoverStyle(base: string, hover: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = hover;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = base;
    },
  };
}
