import React from 'react';
import './CardFrame.css';
import type { Card, CardType } from '../../types/gameTypes';
import {
  iconCardTypePhysicalAttack, iconCardTypeSpecialAttack,
  iconCardTypePhysicalDefense, iconCardTypeSpecialDefense,
  iconCardTypeUtility, iconCardTypeStatusBurn, iconCardTypeStatusRadiation,
  iconLock, iconExhaust,
} from '../../assets/images/GUI';

// ── 카드 타입별 테마 ──

interface CardTheme {
  accent: string;
  accentLight: string;
  artBg: string;
  typeColor: string;
  costBorder: string;
  artIcon: string;      // 이미지 경로
  artIconColor: string;
  typeIcon: string;      // 이미지 경로
  typeLabel: string;
  insetGlow: string;
}

const THEMES: Record<string, CardTheme> = {
  PHYSICAL_ATTACK: {
    accent: '#c0392b', accentLight: '#ff6b6b',
    artBg: 'linear-gradient(160deg, #1a0505 0%, #2d0808 50%, #0a0202 100%)',
    typeColor: '#ff8a80', costBorder: 'rgba(192,57,43,0.6)',
    artIcon: iconCardTypePhysicalAttack, artIconColor: '#ff4444',
    typeIcon: iconCardTypePhysicalAttack, typeLabel: 'Physical Attack',
    insetGlow: 'rgba(192,57,43,0.1)',
  },
  SPECIAL_ATTACK: {
    accent: '#8e44ad', accentLight: '#c39bd3',
    artBg: 'linear-gradient(160deg, #0d0515 0%, #1a0a2e 50%, #070310 100%)',
    typeColor: '#c39bd3', costBorder: 'rgba(142,68,173,0.6)',
    artIcon: iconCardTypeSpecialAttack, artIconColor: '#9b59b6',
    typeIcon: iconCardTypeSpecialAttack, typeLabel: 'Special Attack',
    insetGlow: 'rgba(142,68,173,0.1)',
  },
  PHYSICAL_DEFENSE: {
    accent: '#2980b9', accentLight: '#7fb3d3',
    artBg: 'linear-gradient(160deg, #010d1a 0%, #052038 50%, #010810 100%)',
    typeColor: '#7fb3d3', costBorder: 'rgba(41,128,185,0.6)',
    artIcon: iconCardTypePhysicalDefense, artIconColor: '#2980b9',
    typeIcon: iconCardTypePhysicalDefense, typeLabel: 'Physical Defense',
    insetGlow: 'rgba(41,128,185,0.1)',
  },
  SPECIAL_DEFENSE: {
    accent: '#16a085', accentLight: '#76d7c4',
    artBg: 'linear-gradient(160deg, #010f0c 0%, #052a22 50%, #010d08 100%)',
    typeColor: '#76d7c4', costBorder: 'rgba(22,160,133,0.6)',
    artIcon: iconCardTypeSpecialDefense, artIconColor: '#1abc9c',
    typeIcon: iconCardTypeSpecialDefense, typeLabel: 'Special Defense',
    insetGlow: 'rgba(22,160,133,0.1)',
  },
  UTILITY: {
    accent: '#d4ac0d', accentLight: '#f9e79f',
    artBg: 'linear-gradient(160deg, #131000 0%, #2a2100 50%, #100d00 100%)',
    typeColor: '#f9e79f', costBorder: 'rgba(212,172,13,0.6)',
    artIcon: iconCardTypeUtility, artIconColor: '#d4ac0d',
    typeIcon: iconCardTypeUtility, typeLabel: 'Utility',
    insetGlow: 'rgba(212,172,13,0.08)',
  },
};

const STATUS_THEME: CardTheme = {
  accent: '#6b2233', accentLight: '#aa3355',
  artBg: 'linear-gradient(160deg, #1a0810 0%, #2d0515 50%, #0a0205 100%)',
  typeColor: '#aa5566', costBorder: 'rgba(107,34,51,0.6)',
  artIcon: iconCardTypeStatusBurn, artIconColor: '#aa3344',
  typeIcon: iconCardTypeStatusBurn, typeLabel: 'Status',
  insetGlow: 'rgba(107,34,51,0.1)',
};

function getTheme(type: CardType): CardTheme {
  if (type === 'STATUS_BURN') return { ...STATUS_THEME };
  if (type === 'STATUS_RADIATION') return { ...STATUS_THEME, artIcon: iconCardTypeStatusRadiation, artIconColor: '#44aa44' };
  return THEMES[type] || THEMES.UTILITY;
}

// ── 카드 프레임 컴포넌트 ──

export interface CardFrameProps {
  card: Card;
  width?: number;
  displayApCost?: number;
  isLocked?: boolean;
}

const BASE_W = 220;
const BASE_H = 320;

export const CardFrame: React.FC<CardFrameProps> = ({
  card,
  width = 220,
  displayApCost,
  isLocked = false,
}) => {
  const theme = getTheme(card.type);
  const scale = width / BASE_W;
  const height = BASE_H * scale;
  const apCost = displayApCost ?? card.costAp;

  return (
    <div style={{ width, height, position: 'relative' }}>
      <div
        className={`cf-inner${card.isUpgraded ? ' cf-is-upgraded' : ''}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          '--cf-accent': theme.accent,
          '--cf-accent-light': theme.accentLight,
          '--cf-type-color': theme.typeColor,
          '--cf-cost-border': theme.costBorder,
          '--cf-art-icon-color': theme.artIconColor,
          '--cf-inset-glow': theme.insetGlow,
        } as React.CSSProperties}
      >
        {/* Corner ornaments */}
        <div className="cf-corner cf-tl" />
        <div className="cf-corner cf-tr" />
        <div className="cf-corner cf-bl" />
        <div className="cf-corner cf-br" />

        {/* Accent bars */}
        <div className="cf-accent-top" />
        <div className="cf-accent-bottom" />
        <div className="cf-corner-glow" />

        {/* Header: name + cost */}
        <div className="cf-header">
          <div className="cf-name">{card.name}</div>
          <div className="cf-cost-row">
            <div className="cf-cost-pill">
              <span className="cf-cost-val">{apCost}</span>
              <span className="cf-cost-lbl">AP</span>
            </div>
            {card.costAmmo > 0 && (
              <div className="cf-cost-pill">
                <span className="cf-cost-val">{card.costAmmo}</span>
                <span className="cf-cost-lbl">AMMO</span>
              </div>
            )}
          </div>
        </div>
        <div className="cf-header-divider" />

        {/* Art area */}
        <div className="cf-art-area">
          <div className="cf-art-bg" style={{ background: theme.artBg }}>
            <img className="cf-art-icon" src={theme.artIcon} alt="" />
          </div>
        </div>

        {/* Divider + Description */}
        <div className="cf-divider" />
        <div className="cf-desc">{card.description}</div>

        {/* Type badge */}
        <div className="cf-type-badge">
          <img className="cf-type-icon-img" src={theme.typeIcon} alt="" />
          <span className="cf-type-label">{theme.typeLabel}</span>
        </div>

        {/* Exhaust mark */}
        {card.isExhaust && (
          <div className="cf-exhaust-mark">
            <img src={iconExhaust} alt="EX" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}

        {/* Lock overlay */}
        {isLocked && (
          <div className="cf-lock-overlay">
            <img src={iconLock} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
        )}
      </div>
    </div>
  );
};

/** 카드 타입에 대응하는 accent 색상 (외부에서 사용) */
export function getCardAccentColor(type: CardType): string {
  return getTheme(type).accent;
}
