import React, { useState, useEffect } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { useMapStore } from '../../store/useMapStore';

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

type Phase = 'CLEAR' | 'TRANSITION' | 'REVEAL' | 'READY';

export const ChapterTransitionModal: React.FC = () => {
  const { currentChapter, setChapter, setScene, saveRunData } = useRunStore();
  const nextChapter = currentChapter + 1;
  const data = CHAPTER_DATA[nextChapter] || { title: `챕터 ${nextChapter}`, subtitle: '???', description: '미지의 영역으로...', color: '#aaa' };

  const [phase, setPhase] = useState<Phase>('CLEAR');
  const [fadeOut, setFadeOut] = useState(false);

  // 단계별 자동 진행
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('TRANSITION'), 2000);
    const t2 = setTimeout(() => setPhase('REVEAL'), 3500);
    const t3 = setTimeout(() => setPhase('READY'), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleProceed = async () => {
    setFadeOut(true);
    await new Promise(r => setTimeout(r, 600));
    setChapter(nextChapter);
    useMapStore.setState({ currentFloor: 1, nodes: [], currentNodeId: null, visitedNodeIds: [], pendingNodeId: null, mapChapter: nextChapter });
    setScene('MAP');
    await saveRunData();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#000', zIndex: 999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease-out',
    }}>
      {/* Phase 1: 클리어 메시지 */}
      <div style={{
        opacity: phase === 'CLEAR' ? 1 : 0,
        transform: phase === 'CLEAR' ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        position: 'absolute',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          fontSize: '48px', color: '#fbbf24', fontWeight: 'bold',
          textShadow: '0 0 30px rgba(251, 191, 36, 0.6)',
          animation: 'fadeIn 1s ease-out',
        }}>
          챕터 {currentChapter} 클리어!
        </div>
        <div style={{
          width: '300px', height: '2px', marginTop: '16px',
          background: 'linear-gradient(to right, transparent, rgba(251, 191, 36, 0.5), transparent)',
        }} />
      </div>

      {/* Phase 2: 전환 연출 (암전 후 새 챕터) */}
      <div style={{
        opacity: phase === 'TRANSITION' ? 1 : 0,
        transition: 'opacity 1.2s ease-in-out',
        position: 'absolute',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          fontSize: '18px', color: '#666',
          letterSpacing: '8px',
        }}>
          · · ·
        </div>
      </div>

      {/* Phase 3-4: 새 챕터 정보 */}
      <div style={{
        opacity: (phase === 'REVEAL' || phase === 'READY') ? 1 : 0,
        transform: (phase === 'REVEAL' || phase === 'READY') ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
        position: 'absolute',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          fontSize: '18px', color: '#9ca3af',
          letterSpacing: '6px', marginBottom: '8px',
        }}>
          {data.title}
        </div>
        <div style={{
          fontSize: '52px', color: data.color, fontWeight: 'bold',
          marginBottom: '20px',
          textShadow: `0 0 30px ${data.color}60`,
          letterSpacing: '4px',
        }}>
          {data.subtitle}
        </div>
        <p style={{
          fontSize: '16px', color: '#d1d5db', textAlign: 'center', lineHeight: '1.8',
          maxWidth: '500px', marginBottom: '40px', whiteSpace: 'pre-line',
          opacity: phase === 'READY' ? 1 : 0.6,
          transition: 'opacity 0.8s ease-out',
        }}>
          {data.description}
        </p>

        {phase === 'READY' && (
          <button
            onClick={handleProceed}
            style={{
              padding: '16px 56px',
              fontSize: '20px', fontWeight: 'bold',
              background: 'none', color: data.color,
              border: `1px solid ${data.color}60`, borderRadius: '6px', cursor: 'pointer',
              transition: 'all 0.2s',
              animation: 'fadeIn 0.8s ease-out',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${data.color}99`; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${data.color}60`; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            다음 구역으로 진입
          </button>
        )}
      </div>
    </div>
  );
};
