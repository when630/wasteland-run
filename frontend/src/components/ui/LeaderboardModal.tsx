import React, { useEffect, useState } from 'react';
import { authApi } from '../../api/auth';

interface LeaderboardItem {
  username: string;
  score: number;
  clearLayer: number;
  playTimeSeconds: number;
}

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchLeaderboard = async () => {
      try {
        const res = await authApi.get('/leaderboard', { signal: abortController.signal });
        setLeaders(res.data);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error('리더보드 로드 실패', err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    fetchLeaderboard();
    return () => abortController.abort();
  }, []);

  // 분/초 포매팅
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}분 ${s}초`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '600px', maxHeight: '80vh', padding: '30px', backgroundColor: '#1a1f24',
        borderRadius: '16px', border: '2px solid #5a7a9a',
        display: 'flex', flexDirection: 'column', gap: '20px',
        boxShadow: '0 0 30px rgba(90, 122, 154, 0.4)',
        overflowY: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#88aabb', fontSize: '32px', margin: 0 }}>명예의 전당 (Top 50)</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
          {isLoading ? (
            <div style={{ color: '#ccc', textAlign: 'center', padding: '40px' }}>데이터 수신 중...</div>
          ) : leaders.length === 0 ? (
            <div style={{ color: '#ccc', textAlign: 'center', padding: '40px' }}>아직 등록된 기록이 없습니다. 최초의 생존자가 되어보세요!</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #5a7a9a', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>순위</th>
                  <th style={{ padding: '10px' }}>요원명</th>
                  <th style={{ padding: '10px' }}>점수</th>
                  <th style={{ padding: '10px' }}>도달 층수</th>
                  <th style={{ padding: '10px' }}>클리어 타임</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #334455', backgroundColor: idx % 2 === 0 ? '#1f262c' : 'transparent' }}>
                    <td style={{ padding: '12px', color: idx < 3 ? '#ffd700' : '#ccc', fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.username}</td>
                    <td style={{ padding: '12px', color: '#ffaa00' }}>{item.score}</td>
                    <td style={{ padding: '12px' }}>{item.clearLayer}층</td>
                    <td style={{ padding: '12px' }}>{formatTime(item.playTimeSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
