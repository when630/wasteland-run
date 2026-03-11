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
  const { isMobile } = useResponsive();
  const nextChapter = currentChapter + 1;
  const data = CHAPTER_DATA[nextChapter] || { title: `챕터 ${nextChapter}`, subtitle: '???', description: '미지의 영역으로...', color: '#aaa' };

  const handleProceed = async () => {
    setChapter(nextChapter);
    // 새 챕터를 위한 맵 재생성
    useMapStore.setState({ currentFloor: 1, nodes: [], currentNodeId: null, visitedNodeIds: [] });
    setScene('MAP');
    await saveRunData();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 1.5s ease-in-out', color: '#fff'
    }}>
      {/* 챕터 클리어 축하 */}
      <div style={{
        fontSize: isMobile ? '24px' : '36px', color: '#fbbf24', fontWeight: 'bold', marginBottom: '10px',
        textShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
      }}>
        챕터 {currentChapter} 클리어!
      </div>

      {/* 구분선 */}
      <div style={{ width: isMobile ? '200px' : '300px', height: '2px', background: 'linear-gradient(to right, transparent, #555, transparent)', margin: '20px 0' }} />

      {/* 다음 챕터 소개 */}
      <div style={{
        fontSize: isMobile ? '16px' : '20px', color: '#9ca3af', letterSpacing: isMobile ? '3px' : '5px', marginBottom: '8px'
      }}>
        {data.title}
      </div>
      <div style={{
        fontSize: isMobile ? '28px' : '48px', color: data.color, fontWeight: 'bold', marginBottom: '20px',
        textShadow: `0 0 25px ${data.color}50`, letterSpacing: '3px'
      }}>
        {data.subtitle}
      </div>
      <p style={{
        fontSize: isMobile ? '14px' : '18px', color: '#d1d5db', textAlign: 'center', lineHeight: '1.8',
        maxWidth: isMobile ? '90%' : '500px', marginBottom: isMobile ? '25px' : '40px', whiteSpace: 'pre-line'
      }}>
        {data.description}
      </p>

      <button
        onClick={handleProceed}
        style={{
          padding: isMobile ? '12px 40px' : '18px 60px', fontSize: isMobile ? '16px' : '22px', fontWeight: 'bold',
          backgroundColor: '#1e40af', color: '#fff',
          border: `2px solid ${data.color}`, borderRadius: '12px', cursor: 'pointer',
          boxShadow: `0 0 15px ${data.color}40`,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 0 25px ${data.color}60`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 15px ${data.color}40`; }}
      >
        다음 구역으로 진입
      </button>
    </div>
  );
};
