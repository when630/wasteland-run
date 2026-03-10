import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';
import { RELICS } from '../../assets/data/relics';
import { useAudioStore } from '../../store/useAudioStore';
import { SettingsModal } from './SettingsModal';
import { MapView } from '../../pages/MapView';

export const HUD: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false);
  const { playerHp, playerMaxHp, gold, currentScene, setIsLeaderboardOpen } = useRunStore();
  const { enemies, applyDamageToEnemy } = useBattleStore();
  const { drawPile, hand, discardPile, exhaustPile, setViewingPile } = useDeckStore();
  const isMap = currentScene === 'MAP';
  const relicsList = useRunStore(state => state.relics);

  // 🌟 새롭게 추가된 유물 호버 및 선택 상태
  const [hoveredRelic, setHoveredRelic] = useState<any | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [selectedRelic, setSelectedRelic] = useState<any | null>(null);

  const handleKillAll = () => {
    useAudioStore.getState().playClick();
    enemies.forEach(enemy => {
      if (enemy.currentHp > 0) {
        applyDamageToEnemy(enemy.id, 9999, 'PIERCING');
      }
    });
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '60px',
        // 슬레이 더 스파이어 느낌으로 상단 바는 투명/그라데이션 처리
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        boxSizing: 'border-box',
        // borderBottom 제거
        zIndex: 10
      }}>
        {/* 🌟 좌측 정보: 층수, 체력, 골드 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '18px', fontWeight: 'bold', textShadow: '2px 2px 2px black' }}>
          <div style={{ color: '#aaa', fontSize: '16px' }}>
            오염된 외곽 도시 (초입)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ff5555' }}>
            <span>❤️</span>
            <span>{playerHp} / {playerMaxHp}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffd700' }}>
            <span>🪙</span>
            <span>{gold}</span>
          </div>
        </div>

        <div style={{ flex: 1 }} /> {/* 우측 아이콘들을 우측 끝으로 밀어주는 역할 */}

        {/* 지도 버튼 — 맵 화면에서만 숨김 */}
        {!isMap && (
          <div
            onClick={() => {
              useAudioStore.getState().playClick();
              setIsMapOverlayOpen(true);
            }}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '24px',
              marginRight: '15px',
              textShadow: '2px 2px 2px black',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="지도 보기"
          >
            🗺️
          </div>
        )}

        {/* 🌟 명예의 전당 버튼 (트로피) */}
        <div
          onClick={() => {
            useAudioStore.getState().playClick();
            setIsLeaderboardOpen(true);
          }}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: '24px',
            marginRight: '15px',
            textShadow: '2px 2px 2px black',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="명예의 전당"
        >
          🏆
        </div>

        {/* 🌟 환경 설정 버튼 (새 톱니바퀴 모달) */}
        <div
          onClick={() => {
            useAudioStore.getState().playClick();
            setIsSettingsOpen(true);
          }}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: '24px',
            marginRight: '15px',
            textShadow: '2px 2px 2px black',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="환경 설정"
        >
          ⚙️
        </div>

        {/* 🌟 기존 메뉴 버튼 & 드롭다운 (디버그 아이콘으로 변경) */}
        <div style={{ position: 'relative', marginRight: '15px' }}>
          <div
            onClick={() => {
              useAudioStore.getState().playClick();
              setIsMenuOpen(!isMenuOpen);
            }}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '24px',
              textShadow: '2px 2px 2px black',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="디버그 메뉴"
          >
            🐛
          </div>

          {isMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '180px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 100
            }}>
              <div style={{ fontSize: '12px', color: '#aaa', borderBottom: '1px solid #444', paddingBottom: '4px', marginBottom: '4px' }}>
                디버그 / 치트 기능
              </div>
              {/* 모든 유물 획득 버튼 */}
              <div
                onClick={() => {
                  useAudioStore.getState().playClick();
                  const { relics, addRelic } = useRunStore.getState();
                  RELICS.forEach(r => {
                    if (!relics.includes(r.id)) addRelic(r.id);
                  });
                  setIsMenuOpen(false); // 실행 후 메뉴 닫기
                }}
                style={{
                  backgroundColor: '#2266aa',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#114488'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2266aa'}
              >
                💎 모든 유물 획득
              </div>

              {/* 전원 처치 (Kill) 버튼 */}
              <div
                onClick={() => {
                  handleKillAll();
                  setIsMenuOpen(false); // 실행 후 메뉴 닫기
                }}
                style={{
                  backgroundColor: '#ff4444',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cc3333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff4444'}
              >
                🔥 적 전원 처치
              </div>
            </div>
          )}
        </div>

        <div
          onClick={() => setViewingPile('DECK')}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: '24px',
            textShadow: '2px 2px 2px black',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="전체 덱 보기"
        >
          🃏 <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{drawPile.length + hand.length + discardPile.length + exhaustPile.length}</span>
        </div>
      </div>

      {/* 🌟 슬레이 더 스파이어 스타일: 유물 목록은 헤더 바로 아래 좌측 정렬 */}
      <div style={{
        position: 'absolute',
        top: '65px',
        left: '20px',
        display: 'flex',
        flexWrap: 'wrap', // 많아지면 다음 줄로 넘어감
        gap: '8px',
        maxWidth: '60%', // 화면의 60% 정도까지만 펼쳐지고 줄바꿈
        zIndex: 10
      }}>
        {relicsList.map((relicId) => {
          const relicData = RELICS.find((r: any) => r.id === relicId);
          if (!relicData) return null;
          return (
            <div
              key={relicId}
              onClick={() => {
                useAudioStore.getState().playClick();
                setSelectedRelic(relicData);
                setHoveredRelic(null); // 클릭 시 호버 툴팁은 숨김
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverPosition({ x: rect.left, y: rect.bottom + 10 });
                setHoveredRelic(relicData);
                e.currentTarget.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={(e) => {
                setHoveredRelic(null);
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
                width: '36px', height: '36px',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                border: '1px solid #777',
                borderRadius: '50%', // 둥근 유물 뱃지
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '20px', cursor: 'pointer', userSelect: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                transition: 'transform 0.1s'
              }}
            >
              {relicData.image ? <img src={relicData.image} alt={relicData.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : relicData.icon}
            </div>
          );
        })}
      </div>

      {/* 🌟 커스텀 유물 툴팁 */}
      {hoveredRelic && (
        <div style={{
          position: 'absolute',
          left: `${hoverPosition.x}px`,
          top: `${hoverPosition.y}px`,
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid #777',
          borderRadius: '6px',
          padding: '10px 15px',
          color: '#eee',
          maxWidth: '300px',
          zIndex: 500,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#ffaaaa', marginBottom: '4px' }}>
            {hoveredRelic.name} <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 'normal' }}>[{hoveredRelic.tier}]</span>
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
            {hoveredRelic.description}
          </div>
          <div style={{ fontSize: '10px', color: '#777', marginTop: '6px', fontStyle: 'italic' }}>
            클릭하여 자세히 보기
          </div>
        </div>
      )}

      {/* 🌟 유물 상세 정보 클릭 모달 */}
      {selectedRelic && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* 바깥 영역 클릭 시 닫기 */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }} onClick={() => setSelectedRelic(null)} />

          <div style={{
            position: 'relative',
            width: '320px',
            backgroundColor: '#2a2a2a',
            border: '2px solid #ffaaaa',
            borderRadius: '12px',
            padding: '30px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
            zIndex: 10000
          }}>
            <button
              onClick={() => setSelectedRelic(null)}
              style={{
                position: 'absolute', top: '10px', right: '15px',
                background: 'none', border: 'none', color: '#888',
                fontSize: '24px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              ×
            </button>
            <div style={{ width: '100px', height: '100px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {selectedRelic.image ? <img src={selectedRelic.image} alt={selectedRelic.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '80px' }}>{selectedRelic.icon}</span>}
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 5px 0', textAlign: 'center' }}>
              {selectedRelic.name}
            </h2>
            <div style={{ color: '#ffaaaa', fontSize: '14px', marginBottom: '20px' }}>
              등급: {selectedRelic.tier}
            </div>
            <p style={{ color: '#ddd', fontSize: '16px', lineHeight: '1.5', textAlign: 'center', margin: 0 }}>
              {selectedRelic.description}
            </p>
          </div>
        </div>
      )}

      {/* 🌟 환경 설정 모달 렌더링 */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} showQuitButton={true} />}

      {/* 맵 오버레이 (전투 중 지도 보기) */}
      {isMapOverlayOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 9999
        }}>
          <MapView viewOnly onClose={() => setIsMapOverlayOpen(false)} />
        </div>
      )}
    </>
  );
};
