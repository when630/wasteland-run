import React, { useState, useMemo } from 'react';
import { ALL_CARDS } from '../../assets/data/cards';
import { RELICS } from '../../assets/data/relics';
import { BASE_ENEMIES } from '../../assets/data/enemies';
import { CardCompendiumItem } from './compendium/CardCompendiumItem';
import { RelicCompendiumItem } from './compendium/RelicCompendiumItem';
import { EnemyCompendiumItem } from './compendium/EnemyCompendiumItem';
import { iconClose } from '../../assets/images/GUI';

interface CompendiumModalProps {
  onClose: () => void;
}

type Tab = 'CARDS' | 'RELICS' | 'ENEMIES';

const CARD_TYPE_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'PHYSICAL_ATTACK', label: '물리 공격', color: '#ef4444' },
  { value: 'SPECIAL_ATTACK', label: '특수 공격', color: '#a855f7' },
  { value: 'PHYSICAL_DEFENSE', label: '물리 방어', color: '#3b82f6' },
  { value: 'SPECIAL_DEFENSE', label: '특수 방어', color: '#06b6d4' },
  { value: 'UTILITY', label: '유틸', color: '#22c55e' },
] as const;

const RELIC_TIER_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'STARTER', label: '시작', color: '#9ca3af' },
  { value: 'COMMON', label: '일반', color: '#9ca3af' },
  { value: 'UNCOMMON', label: '고급', color: '#3b82f6' },
  { value: 'RARE', label: '희귀', color: '#fbbf24' },
  { value: 'BOSS', label: '보스', color: '#ef4444' },
] as const;

const ENEMY_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'CH1', label: '1막' },
  { value: 'CH2', label: '2막' },
  { value: 'CH3', label: '3막' },
  { value: 'NORMAL', label: '일반', color: '#9ca3af' },
  { value: 'ELITE', label: '엘리트', color: '#a855f7' },
  { value: 'BOSS', label: '보스', color: '#ef4444' },
] as const;

export const CompendiumModal: React.FC<CompendiumModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('CARDS');
  const [cardFilter, setCardFilter] = useState('ALL');
  const [relicFilter, setRelicFilter] = useState('ALL');
  const [enemyFilter, setEnemyFilter] = useState('ALL');

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 24px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: isActive ? '#374151' : 'transparent',
    color: isActive ? '#fbbf24' : '#9ca3af',
    border: `2px solid ${isActive ? '#fbbf24' : '#4b5563'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const filterBtnStyle = (active: boolean, color?: string): React.CSSProperties => ({
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: active ? 'bold' : 'normal',
    fontFamily: '"Galmuri11", monospace',
    backgroundColor: active ? (color || '#555') : 'transparent',
    color: active ? '#000' : (color || '#aaa'),
    border: `1px solid ${color || '#555'}`,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const filteredCards = useMemo(() => {
    if (cardFilter === 'ALL') return ALL_CARDS;
    return ALL_CARDS.filter(c => c.type === cardFilter);
  }, [cardFilter]);

  const filteredRelics = useMemo(() => {
    if (relicFilter === 'ALL') return RELICS;
    return RELICS.filter(r => r.tier === relicFilter);
  }, [relicFilter]);

  const enemyGroups = useMemo(() => {
    const all = Object.keys(BASE_ENEMIES);
    let filtered = all;
    if (enemyFilter.startsWith('CH')) {
      const ch = parseInt(enemyFilter.slice(2));
      filtered = all.filter(id => (BASE_ENEMIES[id] as any).chapter === ch);
    } else if (enemyFilter !== 'ALL') {
      filtered = all.filter(id => BASE_ENEMIES[id].tier === enemyFilter);
    }

    // 막별 그룹핑
    const groups: { chapter: number; ids: string[] }[] = [];
    const chapterMap = new Map<number, string[]>();
    for (const id of filtered) {
      const ch = (BASE_ENEMIES[id] as any).chapter || 0;
      if (!chapterMap.has(ch)) chapterMap.set(ch, []);
      chapterMap.get(ch)!.push(id);
    }
    const sortedChapters = [...chapterMap.keys()].sort((a, b) => a - b);
    for (const ch of sortedChapters) {
      groups.push({ chapter: ch, ids: chapterMap.get(ch)! });
    }
    return groups;
  }, [enemyFilter]);

  const currentFilters = activeTab === 'CARDS' ? CARD_TYPE_FILTERS
    : activeTab === 'RELICS' ? RELIC_TIER_FILTERS
    : ENEMY_FILTERS;

  const currentFilterValue = activeTab === 'CARDS' ? cardFilter
    : activeTab === 'RELICS' ? relicFilter
    : enemyFilter;

  const setCurrentFilter = activeTab === 'CARDS' ? setCardFilter
    : activeTab === 'RELICS' ? setRelicFilter
    : setEnemyFilter;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 5, 3, 0.92)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      color: '#fff',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      {/* Header */}
      <div style={{
        width: '100%', padding: '16px 40px',
        display: 'flex', alignItems: 'center',
        borderBottom: '2px solid #333', backgroundColor: '#111', boxSizing: 'border-box',
        gap: '24px',
      }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 'bold', color: '#fbbf24',
          textShadow: '0 0 10px rgba(251, 191, 36, 0.5)', margin: 0,
          flexShrink: 0,
        }}>
          도감
        </h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={tabButtonStyle(activeTab === 'CARDS')} onClick={() => setActiveTab('CARDS')}>
            카드 ({ALL_CARDS.length})
          </button>
          <button style={tabButtonStyle(activeTab === 'RELICS')} onClick={() => setActiveTab('RELICS')}>
            유물 ({RELICS.length})
          </button>
          <button style={tabButtonStyle(activeTab === 'ENEMIES')} onClick={() => setActiveTab('ENEMIES')}>
            적 ({Object.keys(BASE_ENEMIES).length})
          </button>
        </div>

        <div style={{ flex: 1 }} />

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }} onClick={onClose}>
          <img src={iconClose} alt="닫기" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </button>
      </div>

      {/* 필터 바 */}
      <div style={{
        width: '100%', padding: '10px 40px',
        display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
        backgroundColor: '#0d0d0d', borderBottom: '1px solid #222',
        boxSizing: 'border-box',
      }}>
        <span style={{ fontSize: '12px', color: '#666', marginRight: '4px' }}>필터:</span>
        {currentFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setCurrentFilter(f.value)}
            style={filterBtnStyle(currentFilterValue === f.value, (f as any).color)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        width: '100%', maxWidth: '1200px', flex: 1,
        overflowY: 'auto',
        padding: '30px 20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'ENEMIES'
            ? 'repeat(auto-fill, minmax(160px, 1fr))'
            : activeTab === 'CARDS'
            ? 'repeat(auto-fill, minmax(180px, 1fr))'
            : 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: activeTab === 'ENEMIES' ? '14px' : '20px',
          justifyContent: 'center',
        }}>
          {activeTab === 'CARDS' && filteredCards.map(card => (
            <CardCompendiumItem key={card.baseId} card={card} />
          ))}
          {activeTab === 'RELICS' && filteredRelics.map(relic => (
            <RelicCompendiumItem key={relic.id} relic={relic} />
          ))}
          {activeTab === 'ENEMIES' && <></>}
        </div>

        {/* 적: 막별 그룹 */}
        {activeTab === 'ENEMIES' && enemyGroups.map(group => (
          <div key={group.chapter} style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px', color: '#fbbf24', margin: '0 0 12px 0',
              paddingBottom: '6px', borderBottom: '1px solid #333',
            }}>
              {group.chapter > 0 ? `${group.chapter}막` : '기타'}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '14px',
            }}>
              {group.ids.map(baseId => (
                <EnemyCompendiumItem key={baseId} baseId={baseId} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
