import React from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useMapStore } from '../../store/useMapStore';
import { useResponsive } from '../../hooks/useResponsive';

const CHAPTER_DATA: Record<number, { title: string; subtitle: string; description: string; color: string }> = {
  2: {
    title: '챕터 2',
    subtitle: '무너진 지하철도',
    description: '외곽 도시의 보스를 쓰러뜨린 당신은 지하로 내려가는 입구를 발견합니다.\n폐쇄된 지하철 터널 속에는 더 강력한 존재들이 도사리고 있습니다...',
    color: '#60a5fa',
  },
  3: {
    title: '챕터 3',
    subtitle: '거대 기업의 방주',
    description: '지하철도의 끝에서 거대한 방주 시설을 발견합니다.\n이곳에서 모든 것의 진실을 마주하게 될 것입니다...',
    color: '#a78bfa',
  },
};

export const ChapterTransitionModal: React.FC = () => {
  const { currentChapter, setChapter, setScene, saveRunData } = useRunStore();
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;
  const nextChapter = currentChapter + 1;
  const data = CHAPTER_DATA[nextChapter] || { title: `챕터 ${nextChapter}`, subtitle: '???', description: '미지의 영역으로...', color: '#aaa' };

  const handleProceed = async () => {
    setChapter(nextChapter);
    useMapStore.setState({ currentFloor: 1, nodes: [], currentNodeId: null, visitedNodeIds: [] });
    setScene('MAP');
    await saveRunData();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 1.5s ease-in-out', color: '#fff'
    }}>
      <div style={{
        fontSize: isShortScreen ? '18px' : isMobile ? '24px' : '36px', color: '#fbbf24', fontWeight: 'bold',
        marginBottom: isShortScreen ? '4px' : '10px',
        textShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
      }}>
        챕터 {currentChapter} 클리어!
      </div>

      <div style={{ width: isShortScreen ? '150px' : isMobile ? '200px' : '300px', height: '2px', background: 'linear-gradient(to right, transparent, #555, transparent)', margin: isShortScreen ? '10px 0' : '20px 0' }} />

      <div style={{
        fontSize: isShortScreen ? '13px' : isMobile ? '16px' : '20px', color: '#9ca3af',
        letterSpacing: isShortScreen ? '2px' : isMobile ? '3px' : '5px', marginBottom: isShortScreen ? '4px' : '8px'
      }}>
        {data.title}
      </div>
      <div style={{
        fontSize: isShortScreen ? '22px' : isMobile ? '28px' : '48px', color: data.color, fontWeight: 'bold',
        marginBottom: isShortScreen ? '10px' : '20px',
        textShadow: `0 0 25px ${data.color}50`, letterSpacing: '3px'
      }}>
        {data.subtitle}
      </div>
      {!isShortScreen && (
        <p style={{
          fontSize: isMobile ? '14px' : '18px', color: '#d1d5db', textAlign: 'center', lineHeight: '1.8',
          maxWidth: isMobile ? '90%' : '500px', marginBottom: isMobile ? '25px' : '40px', whiteSpace: 'pre-line'
        }}>
          {data.description}
        </p>
      )}

      <button
        onClick={handleProceed}
        style={{
          padding: isShortScreen ? '8px 24px' : isMobile ? '12px 40px' : '18px 60px',
          fontSize: isShortScreen ? '14px' : isMobile ? '16px' : '22px', fontWeight: 'bold',
          background: 'none', color: data.color,
          border: `1px solid ${data.color}60`, borderRadius: '6px', cursor: 'pointer',
          textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${data.color}99`; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${data.color}60`; }}
      >
        다음 구역으로 진입
      </button>
    </div>
  );
};
