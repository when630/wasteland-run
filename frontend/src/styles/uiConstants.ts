// 통일된 UI 상수
export const UI = {
  // 색상 팔레트
  color: {
    gold: '#d4a854',          // 주요 강조색 (골드)
    goldBright: '#e8c878',    // 골드 호버
    goldBorder: 'rgba(212, 168, 84, 0.5)',
    goldBorderHover: 'rgba(212, 168, 84, 0.8)',
    success: '#66cc88',       // 성공/회복
    successHover: '#88eebb',
    successBorder: 'rgba(60, 180, 100, 0.4)',
    successBorderHover: 'rgba(100, 220, 140, 0.6)',
    danger: '#ff4444',        // 위험/피해
    muted: '#a09078',         // 비활성/스킵
    mutedHover: '#c8b898',
    mutedBorder: 'rgba(120, 100, 70, 0.4)',
    mutedBorderHover: 'rgba(180, 150, 100, 0.6)',
    textPrimary: '#e8dcc8',   // 메인 텍스트 (따뜻한 톤)
    textSecondary: '#ccc0a8',
    textMuted: '#8a7e6a',
    bgDark: '#0a0a0a',
    bgPanel: '#1a1812',       // 패널 배경 (따뜻한 다크)
    bgPanelBorder: '#3a3024',
  },
  // 모달 오버레이
  overlay: 'rgba(5, 5, 3, 0.92)',
  overlayDark: 'rgba(5, 5, 3, 0.95)',
  // z-index 레이어
  z: {
    battleUI: 20,
    hud: 50,
    cardViewer: 100,
    victoryPanel: 200,
    gameOver: 500,
    modal: 1000,        // 일반 모달 (설정, 도감, 통계)
    rewardModal: 2000,  // 보상 모달 (카드/유물/보스유물)
    previewOverlay: 3000, // 카드/유물 프리뷰
  },
  // 텍스트 그림자
  textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
  textShadowSub: '1px 1px 3px rgba(0,0,0,0.8)',
  // 버튼
  button: {
    borderRadius: '6px',
    transition: 'all 0.2s',
    paddingPrimary: '12px 40px',
    paddingSub: '10px 30px',
    fontSizePrimary: '18px',
    fontSizeSub: '16px',
  },
  // 애니메이션
  anim: {
    fadeIn: 'fadeIn 0.3s ease-out',
    fadeInSlow: 'fadeIn 0.6s ease-out',
    slideUp: 'slideUp 0.4s ease-out',
  },
} as const;
