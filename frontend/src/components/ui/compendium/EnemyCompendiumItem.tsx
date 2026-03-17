import React, { useState } from 'react';
import { BASE_ENEMIES, determineNextIntent } from '../../../assets/data/enemies';
import type { EnemyTier } from '../../../types/enemyTypes';
import { iconHeart, iconPhysicalDefense } from '../../../assets/images/GUI';

interface Props {
  baseId: string;
}

const getTierColor = (tier: EnemyTier): string => {
  if (tier === 'BOSS') return '#ef4444';
  if (tier === 'ELITE') return '#a855f7';
  return '#888';
};

const getTierLabel = (tier: EnemyTier): string => {
  if (tier === 'BOSS') return '보스';
  if (tier === 'ELITE') return '엘리트';
  return '일반';
};

const getChapterLabel = (ch?: number): string => {
  if (!ch) return '';
  return `${ch}막`;
};

export const EnemyCompendiumItem: React.FC<Props> = ({ baseId }) => {
  const [showDetail, setShowDetail] = useState(false);
  const enemy = BASE_ENEMIES[baseId];
  const tierColor = getTierColor(enemy.tier);
  const hasSprite = !!enemy.spriteUrl;

  return (
    <>
      {/* 썸네일 카드 */}
      <div
        onClick={() => setShowDetail(true)}
        style={{
          backgroundColor: '#1f2937',
          border: `2px solid ${tierColor}`,
          borderRadius: '10px',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 6px 20px ${tierColor}44`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
        }}
      >
        {/* 이미지 */}
        <div style={{
          width: '120px', height: '120px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#111827', borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {hasSprite ? (
            <img src={enemy.spriteUrl} alt={enemy.name} style={{
              maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
            }} />
          ) : (
            <span style={{ fontSize: '32px', color: '#444' }}>?</span>
          )}
        </div>

        {/* 이름 */}
        <span style={{
          fontSize: '15px', fontWeight: 'bold', color: '#fff',
          textAlign: 'center', lineHeight: '1.2',
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', width: '100%',
        }}>
          {enemy.name}
        </span>

        {/* 등급 */}
        <span style={{
          fontSize: '10px', color: tierColor, fontWeight: 'bold',
          padding: '1px 6px',
          border: `1px solid ${tierColor}`, borderRadius: '3px',
        }}>
          {getChapterLabel(enemy.chapter)} {getTierLabel(enemy.tier)}
        </span>
      </div>

      {/* 상세 모달 */}
      {showDetail && (
        <EnemyDetailModal baseId={baseId} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

// ── 상세 모달 ──
const EnemyDetailModal: React.FC<{ baseId: string; onClose: () => void }> = ({ baseId, onClose }) => {
  const enemy = BASE_ENEMIES[baseId];
  const tierColor = getTierColor(enemy.tier);
  const iconSize = 16;

  const intents = new Set<string>();
  for (let i = 0; i < 30 && intents.size < 5; i++) {
    intents.add(determineNextIntent(baseId).description);
  }

  const sprites: { label: string; url?: string }[] = [
    { label: '기본', url: enemy.spriteUrl },
    { label: '공격', url: enemy.spriteAttackUrl },
    { label: '피격', url: enemy.spriteHitUrl },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1f2e',
          border: `2px solid ${tierColor}`,
          borderRadius: '16px',
          padding: '28px 32px',
          maxWidth: '600px', width: '90%',
          display: 'flex', flexDirection: 'column', gap: '20px',
          boxShadow: `0 0 40px ${tierColor}33`,
          fontFamily: '"Galmuri11", "Courier New", Courier, monospace',
          color: '#fff',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '22px' }}>{enemy.name}</h3>
            <span style={{
              fontSize: '12px', color: tierColor, fontWeight: 'bold',
              padding: '2px 10px',
              border: `1px solid ${tierColor}`, borderRadius: '4px',
            }}>
              {getChapterLabel(enemy.chapter)} {getTierLabel(enemy.tier)}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid #555', borderRadius: '4px',
            color: '#888', cursor: 'pointer', padding: '4px 10px', fontSize: '14px',
            fontFamily: '"Galmuri11", monospace',
          }}>
            닫기
          </button>
        </div>

        {/* 스프라이트 3장 */}
        <div style={{
          display: 'flex', gap: '16px', justifyContent: 'center',
          backgroundColor: '#111827', borderRadius: '12px', padding: '20px',
        }}>
          {sprites.map(({ label, url }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}>
              <div style={{
                width: '140px', height: '140px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#0a0e1a', borderRadius: '8px',
                border: '1px solid #333',
              }}>
                {url ? (
                  <img src={url} alt={label} style={{
                    maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  }} />
                ) : (
                  <span style={{ fontSize: '14px', color: '#444' }}>미제작</span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* 스탯 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: '#2d3748', padding: '6px 14px',
            borderRadius: '6px', fontSize: '14px',
          }}>
            <img src={iconHeart} alt="" style={{ width: iconSize, height: iconSize, objectFit: 'contain', verticalAlign: 'middle' }} /> HP: {enemy.maxHp}
          </div>
          {(enemy as any).initialShield > 0 && (
            <div style={{
              backgroundColor: '#2d3748', padding: '6px 14px',
              borderRadius: '6px', fontSize: '14px',
            }}>
              <img src={iconPhysicalDefense} alt="" style={{ width: iconSize, height: iconSize, objectFit: 'contain', verticalAlign: 'middle' }} /> 초기 방어: {(enemy as any).initialShield}
            </div>
          )}
        </div>

        {/* 행동 패턴 */}
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '14px',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#d1d5db',
          lineHeight: '1.8',
        }}>
          <div style={{ fontWeight: 'bold', color: '#9ca3af', marginBottom: '4px', fontSize: '12px' }}>주요 행동 패턴:</div>
          {Array.from(intents).map((desc, i) => (
            <div key={i}>• {desc}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
