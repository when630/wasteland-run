import React from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useMapStore } from '../../store/useMapStore';
import { useDeckStore } from '../../store/useDeckStore';
import { RELICS } from '../../assets/data/relics';

interface GameOverModalProps {
  result: 'VICTORY' | 'DEFEAT';
}

// 클리어 등급 계산
const calculateGrade = (isVictory: boolean, playTimeSeconds: number, enemiesKilled: number, playerHp: number, playerMaxHp: number): { grade: string; color: string } => {
  if (!isVictory) {
    return { grade: '-', color: '#6b7280' };
  }
  let score = 0;
  // 시간 보너스 (10분 이내 +40, 15분 이내 +30, 20분 이내 +20, 그 이상 +10)
  if (playTimeSeconds < 600) score += 40;
  else if (playTimeSeconds < 900) score += 30;
  else if (playTimeSeconds < 1200) score += 20;
  else score += 10;
  // 체력 보너스 (남은 체력 비율)
  score += Math.floor((playerHp / playerMaxHp) * 30);
  // 처치 수 보너스
  score += Math.min(enemiesKilled * 3, 30);

  if (score >= 85) return { grade: 'S', color: '#fbbf24' };
  if (score >= 70) return { grade: 'A', color: '#34d399' };
  if (score >= 50) return { grade: 'B', color: '#60a5fa' };
  return { grade: 'C', color: '#9ca3af' };
};

export const GameOverModal: React.FC<GameOverModalProps> = ({ result }) => {
  const { playerHp, playerMaxHp, gold, relics, currentChapter, enemiesKilled, cardsPlayed, totalDamageDealt, totalDamageTaken, totalGoldEarned, runStartTime, setIsActive, saveRunData, submitRunStats } = useRunStore();
  const { currentFloor } = useMapStore();
  const { masterDeck } = useDeckStore();

  const isVictory = result === 'VICTORY';
  const playTimeSeconds = Math.floor((Date.now() - runStartTime) / 1000);
  const playTimeMinutes = Math.floor(playTimeSeconds / 60);
  const playTimeRemainSec = playTimeSeconds % 60;

  const { grade, color: gradeColor } = calculateGrade(isVictory, playTimeSeconds, enemiesKilled, playerHp, playerMaxHp);

  const handleReturnToTitle = async () => {
    // 3막 보스 클리어 시 변이 단계 해금
    if (isVictory && currentChapter >= 3) {
      const { mutationStage, maxMutationUnlocked } = useRunStore.getState();
      if (mutationStage >= maxMutationUnlocked && mutationStage < 20) {
        useRunStore.setState({ maxMutationUnlocked: mutationStage + 1 });
      }
    }
    await submitRunStats(isVictory);
    setIsActive(false);
    await saveRunData();
    window.location.reload();
  };

  const reportItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '18px',
    borderBottom: '1px solid #374151',
    paddingBottom: '8px'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 3, 0.95)', zIndex: 500,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 1.5s ease-in-out', color: '#fff', overflowY: 'auto', padding: '40px 0'
    }}>
      {/* 타이틀 */}
      <h1 style={{
        fontSize: isVictory ? '56px' : '64px',
        color: isVictory ? '#fbbf24' : '#ef4444',
        textShadow: isVictory ? '0 0 20px rgba(251, 191, 36, 0.5)' : '0 0 20px rgba(239, 68, 68, 0.5)',
        marginBottom: '10px', letterSpacing: isVictory ? '2px' : '5px'
      }}>
        {isVictory ? `${currentChapter}챕터 클리어!` : 'YOU DIED'}
      </h1>

      <p style={{ fontSize: '20px', color: '#d1d5db', textAlign: 'center', lineHeight: '1.4', maxWidth: '600px', marginBottom: '20px' }}>
        {isVictory
          ? (currentChapter >= 3
            ? '최종 지시자 오메가가 폭발과 함께 붕괴합니다.\n방주의 잔해 너머로 새벽빛이 비추고, 당신은 마침내 황무지를 관통했습니다.'
            : currentChapter >= 2
              ? '심연의 대지렁이 레비아탄이 마지막 비명을 지르며 쓰러졌습니다.\n무너진 지하철도를 지나 황무지의 끝을 향해 발걸음을 옮깁니다.'
              : '거대한 고철 기갑수 브루터스가 굉음과 함께 쓰러졌습니다.\n당신은 매캐한 연기를 뚫고 황무지의 다음 구역으로 발걸음을 옮깁니다.')
          : '황무지의 가혹한 환경 속에서 당신은 결국 쓰러지고 말았습니다.\n누군가 당신의 장비를 챙겨갈 것입니다...'}
      </p>

      {/* 클리어 등급 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px',
        padding: '15px 40px', borderRadius: '12px',
        background: `linear-gradient(135deg, rgba(31,41,55,0.9), rgba(17,24,39,0.9))`,
        border: `2px solid ${gradeColor}`
      }}>
        <span style={{ fontSize: '16px', color: '#9ca3af' }}>클리어 등급</span>
        <span style={{
          fontSize: '48px', fontWeight: '900', color: gradeColor,
          textShadow: `0 0 15px ${gradeColor}50`
        }}>
          {grade}
        </span>
      </div>

      {/* 메인 컨텐츠 영역 — 2열 레이아웃 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* 좌측: 종합 리포트 */}
        <div style={{
          backgroundColor: '#1a1812', border: `2px solid ${isVictory ? '#fbbf24' : '#3a3024'}`,
          borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column',
          gap: '12px', minWidth: '320px'
        }}>
          <h3 style={{ margin: '0 0 5px 0', textAlign: 'center', color: isVictory ? '#fbbf24' : '#9ca3af', fontSize: '22px' }}>
            종합 리포트
          </h3>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>챕터</span>
            <span style={{ fontWeight: 'bold' }}>{currentChapter}막</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>도달한 층수</span>
            <span style={{ fontWeight: 'bold' }}>{currentFloor} / {currentChapter * 15} 층</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>남은 체력</span>
            <span style={{ fontWeight: 'bold', color: playerHp > playerMaxHp * 0.5 ? '#34d399' : playerHp > 0 ? '#fb923c' : '#ef4444' }}>{playerHp} / {playerMaxHp}</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>처치한 적 수</span>
            <span style={{ fontWeight: 'bold' }}>{enemiesKilled} 마리</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>남은 골드</span>
            <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{gold} G</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>사용한 카드</span>
            <span style={{ fontWeight: 'bold' }}>{cardsPlayed} 장</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>가한 총 피해</span>
            <span style={{ fontWeight: 'bold', color: '#f87171' }}>{totalDamageDealt}</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>받은 총 피해</span>
            <span style={{ fontWeight: 'bold', color: '#fb923c' }}>{totalDamageTaken}</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>획득 총 골드</span>
            <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{totalGoldEarned} G</span>
          </div>
          <div style={reportItemStyle}>
            <span style={{ color: '#9ca3af' }}>플레이 시간</span>
            <span style={{ fontWeight: 'bold' }}>{playTimeMinutes}분 {playTimeRemainSec}초</span>
          </div>
        </div>

        {/* 우측: 유물 + 덱 요약 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '280px' }}>

          {/* 획득 유물 목록 */}
          <div style={{
            backgroundColor: '#1a1812', border: '2px solid #3a3024',
            borderRadius: '12px', padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', textAlign: 'center', color: '#ffaaaa', fontSize: '20px' }}>
              획득 유물 ({relics.length}개)
            </h3>
            {relics.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '14px' }}>획득한 유물이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {relics.map((relicId) => {
                  const relicData = RELICS.find(r => r.id === relicId);
                  if (!relicData) return null;
                  return (
                    <div key={relicId} style={{
                      width: '40px', height: '40px',
                      backgroundColor: 'rgba(50, 50, 50, 0.8)',
                      border: '1px solid #666', borderRadius: '50%',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      overflow: 'hidden'
                    }} title={`${relicData.name}: ${relicData.description}`}>
                      {relicData.image
                        ? <img src={relicData.image} alt={relicData.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        : <span style={{ fontSize: '18px' }}>?</span>
                      }
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 최종 덱 요약 */}
          <div style={{
            backgroundColor: '#1a1812', border: '2px solid #3a3024',
            borderRadius: '12px', padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', textAlign: 'center', color: '#60a5fa', fontSize: '20px' }}>
              최종 덱 ({masterDeck.length}장)
            </h3>
            {(() => {
              const TYPE_LABELS: Record<string, string> = {
                PHYSICAL_ATTACK: '물리 공격',
                SPECIAL_ATTACK: '특수 공격',
                PHYSICAL_DEFENSE: '물리 방어',
                SPECIAL_DEFENSE: '특수 방어',
                UTILITY: '변화',
                STATUS_BURN: '화상',
                STATUS_RADIATION: '방사능',
              };
              const typeCounts: Record<string, number> = {};
              masterDeck.forEach(card => {
                const label = TYPE_LABELS[card.type] || card.type;
                typeCounts[label] = (typeCounts[label] || 0) + 1;
              });
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div key={type} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '14px', color: '#d1d5db'
                    }}>
                      <span>{type}</span>
                      <span style={{ fontWeight: 'bold' }}>{count}장</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <button
        onClick={handleReturnToTitle}
        style={{
          padding: '18px 50px', fontSize: '22px', fontWeight: 'bold',
          background: 'none',
          color: isVictory ? '#d4a854' : '#a09078',
          border: `1px solid ${isVictory ? 'rgba(212, 168, 84, 0.5)' : 'rgba(120, 100, 70, 0.4)'}`,
          borderRadius: '6px', cursor: 'pointer',
          textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = isVictory ? 'rgba(212, 168, 84, 0.8)' : 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = isVictory ? '#e8c878' : '#c8b898'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = isVictory ? 'rgba(212, 168, 84, 0.5)' : 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = isVictory ? '#d4a854' : '#a09078'; }}
      >
        타이틀로 돌아가기
      </button>
    </div>
  );
};
