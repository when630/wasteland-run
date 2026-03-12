import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { RANDOM_EVENTS } from '../assets/data/events';
import type { RandomEvent, EventOption } from '../types/eventTypes';
import { RemoveCardModal } from '../components/ui/RemoveCardModal';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';
import { onRestOrEventEnter } from '../logic/relicEffects';
import { useRngStore } from '../store/useRngStore';
import eventBg from '../assets/images/backgrounds/event_map_background.png';
import { iconEvent } from '../assets/images/GUI';
import { useResponsive } from '../hooks/useResponsive';

export const EventView: React.FC = () => {
  const { isMobile } = useResponsive();
  const { setScene, relics, playerMaxHp, healPlayer } = useRunStore();
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [pendingResultText, setPendingResultText] = useState<string | null>(null);
  const [remainingCardRemoves, setRemainingCardRemoves] = useState(0);
  const [removeModalKey, setRemoveModalKey] = useState(0);

  useEffect(() => {
    const eventRng = useRngStore.getState().eventRng;
    const pick = RANDOM_EVENTS[eventRng.nextInt(RANDOM_EVENTS.length)];
    setCurrentEvent(pick);

    const { healAmount } = onRestOrEventEnter(relics, playerMaxHp);
    if (healAmount > 0) {
      healPlayer(healAmount);
      useRunStore.getState().setToastMessage(`불에 탄 작전 지도 — 체력 ${healAmount} 회복!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentEvent) return null;

  const handleOptionSelect = (option: EventOption) => {
    const result = option.onSelect();

    if (result === 'TRIGGER_CARD_REMOVE') {
      setRemainingCardRemoves(1);
      setIsRemoveModalOpen(true);
      setPendingResultText('기계공이 카드를 받아들고 기괴한 웃음을 지으며 완전히 분해해버렸습니다. (카드 제거 완료)');
      return;
    }
    if (result === 'TRIGGER_CARD_REMOVE_2') {
      setRemainingCardRemoves(2);
      setIsRemoveModalOpen(true);
      setPendingResultText('카드 2장을 제거하고 몸의 부담을 덜었습니다. 최대 체력이 15 증가했습니다!');
      return;
    }
    if (result === 'TRIGGER_CARD_UPGRADE') {
      setIsUpgradeModalOpen(true);
      setPendingResultText('홀로그램의 기록을 분석하여 전투 기술을 개선했습니다. (카드 업그레이드 완료)');
      return;
    }
    if (result === 'TRIGGER_ELITE_BATTLE') {
      setScene('ELITE');
      return;
    }
    setResultText(result);
  };

  const handleRemoveComplete = () => {
    if (remainingCardRemoves > 1) {
      setRemainingCardRemoves(prev => prev - 1);
      setRemoveModalKey(prev => prev + 1);
      return;
    }
    setRemainingCardRemoves(0);
    setIsRemoveModalOpen(false);
    if (pendingResultText) {
      setResultText(pendingResultText);
      setPendingResultText(null);
    }
  };

  const handleUpgradeComplete = () => {
    setIsUpgradeModalOpen(false);
    if (pendingResultText) {
      setResultText(pendingResultText);
      setPendingResultText(null);
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundImage: `url(${eventBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(17, 14, 10, 0.75)',
      color: '#e8dcc8',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* 타이틀 */}
      <h1 style={{
        fontSize: isMobile ? '24px' : '44px', color: '#d4a854', marginBottom: '8px',
        textAlign: 'center', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        animation: 'fadeIn 0.6s ease-out',
      }}>
        <img src={iconEvent} alt="" style={{ width: isMobile ? 28 : 44, height: isMobile ? 28 : 44, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,168,84,0.5))' }} />
        {currentEvent.title}
      </h1>

      {/* 설명 패널 */}
      <div style={{
        backgroundColor: 'rgba(20, 16, 12, 0.85)',
        padding: isMobile ? '20px' : '35px',
        borderRadius: '8px',
        maxWidth: '750px', width: isMobile ? '90vw' : undefined,
        textAlign: 'center', marginBottom: isMobile ? '20px' : '35px',
        border: '1px solid rgba(160, 120, 60, 0.3)',
        boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <p style={{ fontSize: isMobile ? '14px' : '18px', color: '#ccc0a8', lineHeight: '1.7', marginBottom: '16px' }}>
          {currentEvent.description}
        </p>
        <p style={{ fontSize: '14px', color: '#8a7e6a', fontStyle: 'italic' }}>
          {currentEvent.visualDesc}
        </p>
      </div>

      {/* 선택지 */}
      {!resultText ? (
        <div style={{
          display: 'flex', gap: '12px', flexDirection: 'column',
          width: isMobile ? '90vw' : '600px',
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
                  padding: '18px 20px',
                  backgroundColor: isDisabled ? 'rgba(30, 25, 20, 0.6)' : 'rgba(40, 32, 22, 0.85)',
                  border: `1px solid ${isDisabled ? 'rgba(80, 60, 40, 0.3)' : 'rgba(160, 120, 60, 0.4)'}`,
                  borderLeft: `3px solid ${isDisabled ? 'rgba(80, 60, 40, 0.3)' : '#b8892e'}`,
                  borderRadius: '6px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontSize: '16px', color: isDisabled ? '#6b6050' : '#e0d4bc', textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: isDisabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.backgroundColor = 'rgba(60, 48, 30, 0.9)';
                    e.currentTarget.style.borderLeftColor = '#d4a854';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 140, 60, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.backgroundColor = 'rgba(40, 32, 22, 0.85)';
                    e.currentTarget.style.borderLeftColor = '#b8892e';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{ color: isDisabled ? '#6b6050' : '#d4a854', fontWeight: 'bold', marginBottom: '6px', fontSize: '17px' }}>
                  {option.label}
                  {isDisabled && ' (조건 미충족)'}
                </div>
                <div style={{ fontSize: '14px', color: isDisabled ? '#5a5040' : '#a09880', lineHeight: '1.4' }}>{option.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'rgba(15, 40, 25, 0.9)',
          padding: isMobile ? '20px' : '30px', borderRadius: '8px',
          border: '1px solid rgba(60, 180, 100, 0.4)',
          borderLeft: '3px solid #44aa66',
          maxWidth: '600px', width: isMobile ? '90vw' : undefined, textAlign: 'center', boxSizing: 'border-box',
          boxShadow: '0 0 25px rgba(60, 180, 100, 0.15)',
          animation: 'slideUp 0.4s ease-out',
        }}>
          <h3 style={{ color: '#66cc88', fontSize: '22px', marginBottom: '16px', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>선택 결과</h3>
          <p style={{ fontSize: '16px', color: '#c8e8d4', lineHeight: '1.6', marginBottom: '25px' }}>
            {resultText}
          </p>
          <button
            onClick={() => setScene('MAP')}
            style={{
              padding: '12px 40px', fontSize: '18px', fontWeight: 'bold',
              backgroundColor: 'rgba(30, 70, 45, 0.9)', color: '#c8e8d4',
              border: '1px solid rgba(60, 180, 100, 0.4)',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(40, 90, 55, 0.95)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(60, 180, 100, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(30, 70, 45, 0.9)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            길을 떠난다
          </button>
        </div>
      )}

      {isRemoveModalOpen && (
        <RemoveCardModal
          key={removeModalKey}
          onClose={() => { setIsRemoveModalOpen(false); setRemainingCardRemoves(0); }}
          onRemoveComplete={handleRemoveComplete}
          title={remainingCardRemoves > 1 ? `제거할 카드를 선택하세요 (${remainingCardRemoves}장 남음)` : undefined}
        />
      )}
      {isUpgradeModalOpen && (
        <UpgradeCardModal
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgradeComplete={handleUpgradeComplete}
        />
      )}
    </div>
  );
};
