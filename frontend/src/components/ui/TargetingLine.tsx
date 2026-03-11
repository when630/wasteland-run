import React from 'react';

interface TargetingLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  /** 'fixed' for portal usage, 'absolute' for in-place */
  positioning?: 'fixed' | 'absolute';
  zIndex?: number;
}

/**
 * 카드 타겟팅 SVG 곡선 + 조준점.
 * 클릭 타겟팅과 드래그 타겟팅에서 동일하게 사용.
 */
export const TargetingLine: React.FC<TargetingLineProps> = ({
  startX, startY, endX, endY,
  positioning = 'absolute',
  zIndex = 15,
}) => {
  const ctrlX = startX + (endX - startX) * 0.5 - 120;
  const ctrlY = startY - 180;

  return (
    <svg style={{
      position: positioning, top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      zIndex,
      filter: 'drop-shadow(0 0 8px rgba(255, 170, 0, 0.7))',
    }}>
      {/* 뒤쪽 글로우 (두껍고 반투명) */}
      <path
        d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`}
        fill="none"
        stroke="#ffaa00"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.2"
      >
        <animate attributeName="stroke-width" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
      </path>

      {/* 메인 커브 (두께 맥동) */}
      <path
        d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`}
        fill="none"
        stroke="#ffaa00"
        strokeWidth="4"
        strokeDasharray="16 16"
        strokeLinecap="round"
      >
        <animate attributeName="stroke-dashoffset" values="128;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
      </path>

      {/* 조준점: 맥동 원 */}
      <circle cx={endX} cy={endY} r="12" fill="none" stroke="#ffaa00" strokeWidth="2" opacity="0.8">
        <animate attributeName="r" values="10;16;10" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" />
      </circle>
      {/* 조준점: 십자선 */}
      <line x1={endX - 6} y1={endY} x2={endX + 6} y2={endY} stroke="#ffaa00" strokeWidth="2" opacity="0.8" />
      <line x1={endX} y1={endY - 6} x2={endX} y2={endY + 6} stroke="#ffaa00" strokeWidth="2" opacity="0.8" />
    </svg>
  );
};
