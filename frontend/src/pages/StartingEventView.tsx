import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useMapStore } from '../store/useMapStore';
import { generateStartingEvent } from '../assets/data/events';
import type { RandomEvent, EventOption } from '../types/eventTypes';
import { RemoveCardModal } from '../components/ui/RemoveCardModal';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';
import { CardRewardModal } from '../components/ui/CardRewardModal';
import { useRngStore } from '../store/useRngStore';
import { ALL_CARDS } from '../assets/data/cards';
import type { Card } from '../types/gameTypes';
import eventBg from '../assets/images/backgrounds/event_map_background.webp';
import { iconEvent } from '../assets/images/GUI';

export const StartingEventView: React.FC = () => {
  const { setScene } = useRunStore();
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCardRewardOpen, setIsCardRewardOpen] = useState(false);
  const [remainingRemoves, setRemainingRemoves] = useState(0);
  const [removeModalKey, setRemoveModalKey] = useState(0);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [rewardCards, setRewardCards] = useState<Card[]>([]);

  useEffect(() => {
    setCurrentEvent(generateStartingEvent());
  }, []);

  if (!currentEvent) return null;

  const generateCardReward = (rareOnly: boolean): Card[] => {
    const lootRng = useRngStore.getState().lootRng;
    const pool = rareOnly
      ? ALL_CARDS.filter(c => c.tier === 'RARE')
      : ALL_CARDS.filter(c => c.tier === 'COMMON' || c.tier === 'UNCOMMON');
    const cards: Card[] = [];
    const picked: string[] = [];
    for (let i = 0; i < 3; i++) {
      const available = pool.filter(c => !picked.includes(c.baseId!));
      const p = (available.length > 0 ? available : pool)[lootRng.nextInt(available.length || pool.length)];
      cards.push(p as Card);
      picked.push(p.baseId!);
    }
    return cards;
  };

  const handleOptionSelect = (option: EventOption) => {
    const result = option.onSelect();

    if (result === 'TRIGGER_CARD_REMOVE') {
      setRemainingRemoves(1); setIsRemoveModalOpen(true);
      setPendingText('카드를 제거했습니다!'); return;
    }
    if (result === 'TRIGGER_CARD_REMOVE_2') {
      setRemainingRemoves(2); setIsRemoveModalOpen(true);
      setPendingText('카드 2장을 제거했습니다!'); return;
    }
    if (result === 'TRIGGER_CARD_UPGRADE') {
      setIsUpgradeModalOpen(true);
      setPendingText('카드를 강화했습니다!'); return;
    }
    if (result === 'TRIGGER_CARD_REWARD') {
      setRewardCards(generateCardReward(false));
      setIsCardRewardOpen(true); return;
    }
    if (result === 'TRIGGER_RARE_CARD_REWARD') {
      setRewardCards(generateCardReward(true));
      setIsCardRewardOpen(true); return;
    }

    setResultText(result);
  };

  const handleContinue = async () => {
    useMapStore.setState({ currentFloor: 1, nodes: [], currentNodeId: null, visitedNodeIds: [], pendingNodeId: null });
    setScene('MAP');
    await useRunStore.getState().saveRunData();
  };

  const txtShadow = '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)';
  const txtShadowSub = '1px 1px 3px rgba(0,0,0,0.8)';

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      backgroundImage: `url(${eventBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(17, 14, 10, 0.75)',
      color: '#e8dcc8',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto', padding: '40px 0',
    }}>
      <h1 style={{
        fontSize: '40px', color: '#d4a854',
        marginBottom: '16px',
        textAlign: 'center', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        textShadow: txtShadow,
        animation: 'fadeIn 0.6s ease-out',
      }}>
        <img src={iconEvent} alt="" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,168,84,0.5))' }} />
        {currentEvent.title}
      </h1>

      {/* 설명 */}
      <div style={{
        maxWidth: '700px',
        textAlign: 'center',
        marginBottom: '28px',
        padding: '0 20px',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <p style={{
          fontSize: '17px',
          color: '#ccc0a8', lineHeight: '1.7',
          marginBottom: '12px',
          textShadow: txtShadowSub,
        }}>
          {currentEvent.description}
        </p>
        <p style={{ fontSize: '14px', color: '#8a7e6a', fontStyle: 'italic', textShadow: txtShadowSub }}>
          {currentEvent.visualDesc}
        </p>
      </div>

      {/* 구분선 */}
      <div style={{ width: '500px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 168, 84, 0.3), transparent)', marginBottom: '16px' }} />

      {!resultText ? (
        <div style={{
          display: 'flex', gap: '8px', flexDirection: 'column',
          width: '600px',
          animation: 'slideUp 0.6s ease-out',
        }}>
          {currentEvent.options.map((option, idx) => {
            const isDisabled = option.condition ? !option.condition() : false;

            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => handleOptionSelect(option)}
                style={{
                  padding: '10px 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(160, 120, 60, 0.15)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  color: isDisabled ? '#6b6050' : '#e0d4bc', textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: isDisabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.borderBottomColor = 'rgba(212, 168, 84, 0.4)'; }}
                onMouseLeave={(e) => { if (!isDisabled) e.currentTarget.style.borderBottomColor = 'rgba(160, 120, 60, 0.15)'; }}
              >
                <div style={{ color: isDisabled ? '#6b6050' : '#d4a854', fontWeight: 'bold', marginBottom: '4px', fontSize: '16px', textShadow: txtShadow }}>
                  {option.label}
                </div>
                <div style={{ fontSize: '14px', color: isDisabled ? '#5a5040' : '#a09880', lineHeight: '1.3', textShadow: txtShadowSub }}>{option.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          maxWidth: '600px',
          textAlign: 'center', padding: '0 20px',
          animation: 'slideUp 0.4s ease-out',
        }}>
          <h3 style={{ color: '#d4a854', fontSize: '22px', marginBottom: '14px', textShadow: txtShadow }}>출발 준비 완료</h3>
          <p style={{ fontSize: '16px', color: '#ccc0a8', lineHeight: '1.6', marginBottom: '24px', textShadow: txtShadowSub }}>
            {resultText}
          </p>
          <button
            onClick={handleContinue}
            style={{
              padding: '12px 40px',
              fontSize: '18px', fontWeight: 'bold',
              background: 'none', color: '#d4a854',
              border: '1px solid rgba(212, 168, 84, 0.4)',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
              textShadow: txtShadow,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.7)'; e.currentTarget.style.color = '#e8c878'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.4)'; e.currentTarget.style.color = '#d4a854'; }}
          >
            황무지로 출발한다
          </button>
        </div>
      )}

      {isRemoveModalOpen && (
        <RemoveCardModal
          key={removeModalKey}
          onClose={() => { setIsRemoveModalOpen(false); setRemainingRemoves(0); }}
          onRemoveComplete={() => {
            if (remainingRemoves > 1) { setRemainingRemoves(p => p - 1); setRemoveModalKey(p => p + 1); return; }
            setIsRemoveModalOpen(false); setRemainingRemoves(0);
            if (pendingText) { setResultText(pendingText); setPendingText(null); }
          }}
          title={remainingRemoves > 1 ? `제거할 카드 선택 (${remainingRemoves}장 남음)` : undefined}
        />
      )}
      {isUpgradeModalOpen && (
        <UpgradeCardModal
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgradeComplete={() => {
            setIsUpgradeModalOpen(false);
            if (pendingText) { setResultText(pendingText); setPendingText(null); }
          }}
        />
      )}
      {isCardRewardOpen && (
        <CardRewardModal
          rewardCards={rewardCards}
          onClose={() => { setIsCardRewardOpen(false); setResultText('카드를 선택하지 않았습니다.'); }}
          onCardSelected={() => { setIsCardRewardOpen(false); setResultText('카드를 획득했습니다!'); }}
        />
      )}
    </div>
  );
};
