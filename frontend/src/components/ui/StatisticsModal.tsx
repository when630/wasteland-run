import React, { useEffect, useState } from 'react';
import { platformLoadStats } from '../../api/platform';
import { iconClose } from '../../assets/images/GUI';

interface UserStatsData {
  totalRuns: number;
  totalClears: number;
  highestFloor: number;
  totalKills: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalCardsPlayed: number;
  totalGoldEarned: number;
  favoriteCard: string | null;
  favoriteCardCount: number;
  favoriteRelic: string | null;
  favoriteRelicCount: number;
}

interface StatisticsModalProps {
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ onClose }) => {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    platformLoadStats()
      .then(data => setStats(data as UserStatsData))
      .catch(() => setError('통계 데이터를 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.90)', zIndex: 1000,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
    fontFamily: '"Galmuri11", "Courier New", Courier, monospace', color: '#fff',
    animation: 'fadeIn 0.3s ease-out'
  };

  const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '20px 40px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '2px solid #333', backgroundColor: '#111', boxSizing: 'border-box'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold', color: '#fbbf24',
    textShadow: '0 0 10px rgba(251, 191, 36, 0.5)', margin: 0
  };

  const contentStyle: React.CSSProperties = {
    flex: 1, width: '100%', maxWidth: '700px',
    padding: '40px 20px',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
    gap: '12px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 'bold', color: '#9ca3af',
    borderBottom: '1px solid #374151',
    paddingBottom: '8px',
    marginTop: '20px'
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '18px',
    padding: '8px 0',
    borderBottom: '1px solid #1f2937'
  };

  const iconSize = 18;

  const renderHeader = () => (
    <div style={headerStyle}>
      <h2 style={titleStyle}>누적 통계</h2>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
        <img src={iconClose} alt="닫기" style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div style={overlayStyle}>
        {renderHeader()}
        <div style={{ ...contentStyle, alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '20px', color: '#9ca3af' }}>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={overlayStyle}>
        {renderHeader()}
        <div style={{ ...contentStyle, alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '20px', color: '#ef4444' }}>{error || '통계 데이터가 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      {renderHeader()}

      <div style={contentStyle}>
        <div style={sectionTitleStyle}>탐험 기록</div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>총 런 횟수</span>
          <span style={{ fontWeight: 'bold' }}>{stats.totalRuns} 회</span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>총 클리어 횟수</span>
          <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{stats.totalClears} 회</span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>최고 도달 층</span>
          <span style={{ fontWeight: 'bold' }}>{stats.highestFloor} 층</span>
        </div>

        <div style={sectionTitleStyle}>전투 기록</div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>총 처치 수</span>
          <span style={{ fontWeight: 'bold' }}>{stats.totalKills} 마리</span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>총 가한 피해</span>
          <span style={{ fontWeight: 'bold', color: '#f87171' }}>{stats.totalDamageDealt.toLocaleString()}</span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>총 받은 피해</span>
          <span style={{ fontWeight: 'bold', color: '#fb923c' }}>{stats.totalDamageTaken.toLocaleString()}</span>
        </div>

        <div style={sectionTitleStyle}>자원 기록</div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>총 카드 사용</span>
          <span style={{ fontWeight: 'bold' }}>{stats.totalCardsPlayed} 장</span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>총 획득 골드</span>
          <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{stats.totalGoldEarned.toLocaleString()} G</span>
        </div>

        <div style={sectionTitleStyle}>최다 기록</div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>가장 많이 사용한 카드</span>
          <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>
            {stats.favoriteCard ? `${stats.favoriteCard} (${stats.favoriteCardCount})` : '-'}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#9ca3af' }}>가장 많이 획득한 유물</span>
          <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>
            {stats.favoriteRelic ? `${stats.favoriteRelic} (${stats.favoriteRelicCount})` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
