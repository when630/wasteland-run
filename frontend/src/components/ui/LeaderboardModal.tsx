import React, { useEffect, useState } from 'react';
import { platformLoadLeaderboard } from '../../api/platform';
import { iconClose } from '../../assets/images/GUI';
import { useResponsive } from '../../hooks/useResponsive';

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
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;

  useEffect(() => {
    const abortController = new AbortController();
    const fetchLeaderboard = async () => {
      try {
        const data = await platformLoadLeaderboard();
        if (!abortController.signal.aborted) {
          setLeaders(data as LeaderboardItem[]);
        }
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

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}분 ${s}초`;
  };

  const cellPad = isShortScreen ? '5px 4px' : isMobile ? '6px' : '10px';
  const tdPad = isShortScreen ? '6px 4px' : isMobile ? '8px 6px' : '12px';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: 'min(600px, 95vw)',
        maxHeight: isShortScreen ? '90%' : '80vh',
        padding: isShortScreen ? '12px' : isMobile ? '16px' : '30px',
        backgroundColor: '#1a1f24',
        borderRadius: isShortScreen ? '10px' : '16px',
        border: '2px solid #5a7a9a',
        display: 'flex', flexDirection: 'column',
        gap: isShortScreen ? '8px' : '15px',
        boxShadow: '0 0 30px rgba(90, 122, 154, 0.4)',
        overflowY: 'hidden', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#88aabb', fontSize: isShortScreen ? '16px' : isMobile ? '20px' : '32px', margin: 0 }}>명예의 전당</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            }}
          >
            <img src={iconClose} alt="닫기" style={{ width: isShortScreen ? 14 : 18, height: isShortScreen ? 14 : 18, objectFit: 'contain' }} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {isLoading ? (
            <div style={{ color: '#ccc', textAlign: 'center', padding: isShortScreen ? '20px' : '40px', fontSize: isShortScreen ? '13px' : '16px' }}>데이터 수신 중...</div>
          ) : leaders.length === 0 ? (
            <div style={{ color: '#ccc', textAlign: 'center', padding: isShortScreen ? '20px' : '40px', fontSize: isShortScreen ? '12px' : '16px' }}>아직 등록된 기록이 없습니다. 최초의 생존자가 되어보세요!</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd', fontSize: isShortScreen ? '11px' : isMobile ? '12px' : '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #5a7a9a', textAlign: 'left' }}>
                  <th style={{ padding: cellPad }}>#</th>
                  <th style={{ padding: cellPad }}>요원명</th>
                  <th style={{ padding: cellPad }}>점수</th>
                  <th style={{ padding: cellPad }}>층수</th>
                  <th style={{ padding: cellPad }}>시간</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #334455', backgroundColor: idx % 2 === 0 ? '#1f262c' : 'transparent' }}>
                    <td style={{ padding: tdPad, color: idx < 3 ? '#ffd700' : '#ccc', fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: tdPad, fontWeight: 'bold', maxWidth: isShortScreen ? '70px' : '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.username}</td>
                    <td style={{ padding: tdPad, color: '#ffaa00' }}>{item.score}</td>
                    <td style={{ padding: tdPad }}>{item.clearLayer}</td>
                    <td style={{ padding: tdPad }}>{formatTime(item.playTimeSeconds)}</td>
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
