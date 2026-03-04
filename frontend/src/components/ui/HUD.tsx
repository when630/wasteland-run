import React, { useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';
import { RELICS } from '../../assets/data/relics';

export const HUD: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { playerHp, playerMaxHp, gold } = useRunStore();
  const { playerStatus, enemies, applyDamageToEnemy } = useBattleStore();
  const { drawPile, hand, discardPile, exhaustPile, setViewingPile } = useDeckStore();
  const relicsList = useRunStore(state => state.relics);

  const handleKillAll = () => {
    enemies.forEach(enemy => {
      if (enemy.currentHp > 0) {
        applyDamageToEnemy(enemy.id, 9999, 'PIERCING');
      }
    });
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '60px',
      backgroundColor: 'rgba(20, 20, 20, 0.8)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      boxSizing: 'border-box',
      borderBottom: '2px solid #444',
      zIndex: 10
    }}>
      <div style={{ marginRight: '30px' }}>
        <strong>Stage 1 - 오염된 외곽 도시</strong>
      </div>
      <div style={{ marginRight: '20px' }}>
        <span style={{ color: '#ff4444' }}>HP:</span> {playerHp} / {playerMaxHp}
      </div>
      <div style={{ marginRight: '20px' }}>
        <span style={{ color: '#4499ff' }}>Shield:</span> {playerStatus.shield} | <span style={{ color: '#9944ff' }}>Resist:</span> {playerStatus.resist}
      </div>
      <div>
        <span style={{ color: '#ffd700' }}>Gold:</span> {gold}
      </div>
      <div style={{ flex: 1 }} /> {/* 우측 정렬을 위한 스페이서 */}

      {/* 🌟 유물 목록 렌더링 영역 */}
      <div style={{ display: 'flex', gap: '8px', marginRight: '20px' }}>
        {relicsList.map((relicId) => {
          const relicData = RELICS.find((r: any) => r.id === relicId);
          if (!relicData) return null;
          return (
            <div
              key={relicId}
              title={`${relicData.name}\n${relicData.description}`}
              style={{
                width: '32px', height: '32px',
                backgroundColor: '#333',
                border: '1px solid #777',
                borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '18px', cursor: 'help', userSelect: 'none'
              }}
            >
              {relicData.icon}
            </div>
          );
        })}
      </div>

      {/* 🌟 메뉴 버튼 & 드롭다운 */}
      <div style={{ position: 'relative', marginRight: '15px' }}>
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            backgroundColor: '#444',
            padding: '5px 15px',
            borderRadius: '4px',
            border: '1px solid #777',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background-color 0.2s',
            fontWeight: 'bold',
            color: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
        >
          <span>☰ 메뉴 옵션</span>
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
          backgroundColor: '#333',
          padding: '5px 15px',
          borderRadius: '4px',
          border: '1px solid #777',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
      >
        <span>전체 보유 덱: <strong>{drawPile.length + hand.length + discardPile.length + exhaustPile.length}</strong>장</span>
      </div>
    </div>
  );
};
