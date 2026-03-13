import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { RANDOM_EVENTS } from '../assets/data/events';
import type { RandomEvent, EventOption } from '../types/eventTypes';
import { RemoveCardModal } from '../components/ui/RemoveCardModal';
import { UpgradeCardModal } from '../components/ui/UpgradeCardModal';
import { onRestOrEventEnter } from '../logic/relicEffects';
import { useRngStore } from '../store/useRngStore';
import eventBg from '../assets/images/backgrounds/event_map_background.webp';
import { iconEvent } from '../assets/images/GUI';
import { useResponsive } from '../hooks/useResponsive';

export const EventView: React.FC = () => {
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;
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
      justifyContent: isMobile ? 'flex-start' : 'center',
      overflowY: 'auto', padding: isMobile ? '32px 0 48px' : '40px 0',
    }}>
      {/* 타이틀 */}
      <h1 style={{
        fontSize: isShortScreen ? '20px' : isMobile ? '24px' : '40px', color: '#d4a854',
        marginBottom: isShortScreen ? '6px' : isMobile ? '10px' : '16px',
        textAlign: 'center', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        textShadow: txtShadow,
        animation: 'fadeIn 0.6s ease-out',
      }}>
        <img src={iconEvent} alt="" style={{ width: isMobile ? 28 : 40, height: isMobile ? 28 : 40, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,168,84,0.5))' }} />
        {currentEvent.title}
      </h1>

      {/* 설명 */}
      <div style={{
        maxWidth: '700px', width: isMobile ? '90vw' : undefined,
        textAlign: 'center',
        marginBottom: isShortScreen ? '10px' : isMobile ? '16px' : '28px',
        padding: isMobile ? '0 4px' : '0 20px',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <p style={{
          fontSize: isShortScreen ? '12px' : isMobile ? '14px' : '17px',
          color: '#ccc0a8', lineHeight: isShortScreen ? '1.3' : '1.7',
          marginBottom: isShortScreen ? '4px' : '12px',
          textShadow: txtShadowSub,
        }}>
          {currentEvent.description}
        </p>
        {!isShortScreen && (
          <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#8a7e6a', fontStyle: 'italic', textShadow: txtShadowSub }}>
            {currentEvent.visualDesc}
          </p>
        )}
      </div>

      {/* 구분선 */}
      <div style={{ width: isMobile ? '80vw' : '500px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 168, 84, 0.3), transparent)', marginBottom: isShortScreen ? '8px' : '16px' }} />

      {/* 선택지 */}
      {!resultText ? (
        <div style={{
          display: 'flex', gap: isShortScreen ? '4px' : isMobile ? '6px' : '8px', flexDirection: 'column',
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
                  padding: isShortScreen ? '6px 4px' : isMobile ? '8px 6px' : '10px 8px',
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
                <div style={{ color: isDisabled ? '#6b6050' : '#d4a854', fontWeight: 'bold', marginBottom: isMobile ? '1px' : '4px', fontSize: isShortScreen ? '13px' : isMobile ? '14px' : '16px', textShadow: txtShadow }}>
                  {option.label}
                  {isDisabled && ' (조건 미충족)'}
                </div>
                <div style={{ fontSize: isShortScreen ? '11px' : isMobile ? '12px' : '14px', color: isDisabled ? '#5a5040' : '#a09880', lineHeight: '1.3', textShadow: txtShadowSub }}>{option.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          maxWidth: '600px', width: isMobile ? '90vw' : undefined,
          textAlign: 'center', padding: isMobile ? '0 8px' : '0 20px',
          animation: 'slideUp 0.4s ease-out',
        }}>
          <h3 style={{ color: '#66cc88', fontSize: isShortScreen ? '15px' : isMobile ? '18px' : '22px', marginBottom: isShortScreen ? '6px' : '14px', textShadow: txtShadow }}>선택 결과</h3>
          <p style={{ fontSize: isShortScreen ? '12px' : isMobile ? '14px' : '16px', color: '#c8e8d4', lineHeight: '1.6', marginBottom: isShortScreen ? '12px' : '24px', textShadow: txtShadowSub }}>
            {resultText}
          </p>
          <button
            onClick={() => setScene('MAP')}
            style={{
              padding: isShortScreen ? '8px 24px' : isMobile ? '10px 32px' : '12px 40px',
              fontSize: isShortScreen ? '14px' : isMobile ? '15px' : '18px', fontWeight: 'bold',
              background: 'none', color: '#66cc88',
              border: '1px solid rgba(60, 180, 100, 0.4)',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
              textShadow: txtShadow,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(100, 220, 140, 0.6)'; e.currentTarget.style.color = '#88eebb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(60, 180, 100, 0.4)'; e.currentTarget.style.color = '#66cc88'; }}
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
