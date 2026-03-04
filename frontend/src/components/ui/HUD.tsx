import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';
import { RELICS } from '../../assets/data/relics';
import { useAudioStore } from '../../store/useAudioStore';

export const HUD: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { playerHp, playerMaxHp, gold, setIsLeaderboardOpen } = useRunStore();
  const { enemies, applyDamageToEnemy } = useBattleStore();
  const { drawPile, hand, discardPile, exhaustPile, setViewingPile } = useDeckStore();
  const relicsList = useRunStore(state => state.relics);

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

        {/* 🌟 메뉴 버튼 & 드롭다운 (톱니바퀴) */}
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
            title="설정 및 디버그 메뉴"
          >
            ⚙️
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
              title={`${relicData.name}\n${relicData.description}`}
              style={{
                width: '36px', height: '36px',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                border: '1px solid #777',
                borderRadius: '50%', // 둥근 유물 뱃지
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '20px', cursor: 'help', userSelect: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                transition: 'transform 0.1s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {relicData.icon}
            </div>
          );
        })}
      </div>
    </>
  );
};
