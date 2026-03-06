import React from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useMapStore } from '../../store/useMapStore';

interface GameOverModalProps {
  result: 'VICTORY' | 'DEFEAT';
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ result }) => {
  const { gold, enemiesKilled, setIsActive, saveRunData } = useRunStore();
  const { currentFloor } = useMapStore();

  const handleReturnToTitle = async () => {
    // 런 종료 (Game Over 또는 챕터 클리어 시)
    setIsActive(false);
    await saveRunData();
    window.location.reload(); // 앱 초기화 리로드 (MainMenuView로 리다이렉트됨)
  };

  const isVictory = result === 'VICTORY';
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 999, // 다른 모든 UI 위로
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 1.5s ease-in-out',
    color: '#fff',
    fontFamily: 'sans-serif' // 앱 전역 설정에 따름
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isVictory ? '64px' : '72px',
    color: isVictory ? '#fbbf24' : '#ef4444',
    textShadow: isVictory ? '0 0 20px rgba(251, 191, 36, 0.5)' : '0 0 20px rgba(239, 68, 68, 0.5)',
    marginBottom: '20px',
    letterSpacing: isVictory ? '2px' : '5px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '24px',
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: '1.6',
    maxWidth: '600px',
    marginBottom: '40px'
  };

  const reportContainerStyle: React.CSSProperties = {
    backgroundColor: '#1f2937',
    border: `2px solid ${isVictory ? '#fbbf24' : '#4b5563'}`,
    borderRadius: '12px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '50px',
    minWidth: '350px'
  };

  const reportItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '20px',
    borderBottom: '1px solid #374151',
    paddingBottom: '10px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '20px 60px',
    fontSize: '24px',
    fontWeight: 'bold',
    backgroundColor: isVictory ? '#b45309' : '#4b5563',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: `0 0 15px ${isVictory ? 'rgba(180,83,9,0.5)' : 'rgba(75,85,99,0.5)'}`,
    transition: 'transform 0.2s'
  };

  return (
    <div style={overlayStyle}>
      <h1 style={titleStyle}>{isVictory ? '🎉 1챕터 클리어!' : 'YOU DIED'}</h1>

      <p style={subtitleStyle}>
        {isVictory
          ? '거대한 고철 기갑수 브루터스가 굉음과 함께 쓰러졌습니다.\n당신은 매캐한 연기를 뚫고 황무지의 다음 구역으로 발걸음을 옮깁니다.'
          : '황무지의 가혹한 환경 속에서 당신은 결국 쓰러지고 말았습니다.\n누군가 당신의 장비를 챙겨갈 것입니다...'}
      </p>

      <div style={reportContainerStyle}>
        <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', color: isVictory ? '#fbbf24' : '#9ca3af', fontSize: '24px' }}>
          종합 리포트
        </h3>
        <div style={reportItemStyle}>
          <span style={{ color: '#9ca3af' }}>도달한 층수</span>
          <span style={{ fontWeight: 'bold' }}>{currentFloor} 층</span>
        </div>
        <div style={reportItemStyle}>
          <span style={{ color: '#9ca3af' }}>처치한 적 수</span>
          <span style={{ fontWeight: 'bold' }}>{enemiesKilled} 마리</span>
        </div>
        <div style={reportItemStyle}>
          <span style={{ color: '#9ca3af' }}>남은 골드</span>
          <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>💰 {gold}</span>
        </div>
      </div>

      <button
        onClick={handleReturnToTitle}
        style={buttonStyle}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        타이틀로 돌아가기
      </button>
    </div>
  );
};
