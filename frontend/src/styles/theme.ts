import type React from 'react';

export const colors = {
  bg: {
    dark: '#1a1a1a',
    medium: '#2a2a2a',
    overlay: 'rgba(0,0,0,0.85)',
    overlayLight: 'rgba(0,0,0,0.90)',
  },
  accent: {
    gold: '#ffd700',
    orange: '#ffaa00',
    red: '#ff5555',
    green: '#44ff44',
  },
  border: {
    subtle: '#555',
    medium: '#777',
  },
  tier: {
    common: '#888',
    uncommon: '#4a90e2',
    rare: '#ffd700',
    boss: '#ef4444',
    elite: '#a855f7',
  },
  text: {
    primary: '#fff',
    secondary: '#ccc',
    muted: '#aaa',
    dim: '#777',
  },
} as const;

export const commonStyles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: colors.bg.overlay,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
} as const;
