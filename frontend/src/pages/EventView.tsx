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

export const EventView: React.FC = () => {
  const { setScene, relics, playerMaxHp, healPlayer } = useRunStore();
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  // 모달 호출 제어 상태
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [pendingResultText, setPendingResultText] = useState<string | null>(null);
  const [remainingCardRemoves, setRemainingCardRemoves] = useState(0);
  const [removeModalKey, setRemoveModalKey] = useState(0);

  useEffect(() => {
    const eventRng = useRngStore.getState().eventRng;
    const pick = RANDOM_EVENTS[eventRng.nextInt(RANDOM_EVENTS.length)];
    setCurrentEvent(pick);

    // 유물 효과 일괄 적용
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

    // 특수 트리거 분리
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
      // 강제 엘리트 전투 씬으로 전환
      setScene('ELITE');
      return;
    }

    // 일반 텍스트 결과인 경우 바로 보여주기
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

  const handleCloseResult = () => {
    setScene('MAP');
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundImage: `url(${eventBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: window.innerWidth < 768 ? '24px' : '48px', color: '#a78bfa', marginBottom: '10px', textAlign: 'center', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <img src={iconEvent} alt="" style={{ width: window.innerWidth < 768 ? 28 : 48, height: window.innerWidth < 768 ? 28 : 48, objectFit: 'contain' }} /> {currentEvent.title}
      </h1>

      <div style={{
        backgroundColor: '#1f2937', padding: window.innerWidth < 768 ? '20px' : '40px', borderRadius: '16px',
        maxWidth: '800px', width: window.innerWidth < 768 ? '90vw' : undefined, textAlign: 'center', marginBottom: window.innerWidth < 768 ? '20px' : '40px',
        border: '1px solid #374151', minHeight: window.innerWidth < 768 ? undefined : '150px',
        boxSizing: 'border-box',
      }}>
        <p style={{ fontSize: window.innerWidth < 768 ? '14px' : '20px', color: '#d1d5db', lineHeight: '1.6', marginBottom: '20px' }}>
          {currentEvent.description}
        </p>
        <p style={{ fontSize: '16px', color: '#9ca3af', fontStyle: 'italic' }}>
          {currentEvent.visualDesc}
        </p>
      </div>

      {/* 이벤트 선택지 렌더링 : 결과가 아직 안 나왔을 때만 렌더링 */}
      {!resultText ? (
        <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', width: window.innerWidth < 768 ? '90vw' : '600px' }}>
          {currentEvent.options.map((option, idx) => {
            // 조건문이 존재하고 해당 조건을 만족하지 못하면 disabled 처리
            const isDisabled = option.condition ? !option.condition() : false;

            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => handleOptionSelect(option)}
                style={{
                  padding: '20px',
                  backgroundColor: isDisabled ? '#1f2937' : '#374151',
                  border: `2px solid ${isDisabled ? '#374151' : '#4b5563'}`,
                  borderRadius: '8px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontSize: '18px', color: isDisabled ? '#6b7280' : '#fff', textAlign: 'left',
                  transition: 'background-color 0.2s',
                  opacity: isDisabled ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled) e.currentTarget.style.backgroundColor = '#374151';
                }}
              >
                <div style={{ color: isDisabled ? '#6b7280' : '#fbbf24', fontWeight: 'bold', marginBottom: '8px' }}>
                  {option.label}
                  {isDisabled && ' (달성 조건 미비)'}
                </div>
                <div style={{ fontSize: '15px' }}>{option.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        /* 결과 노출용 컴포넌트 */
        <div style={{
          backgroundColor: '#064e3b', padding: window.innerWidth < 768 ? '20px' : '30px', borderRadius: '12px',
          border: '2px solid #10b981', maxWidth: '600px', width: window.innerWidth < 768 ? '90vw' : undefined, textAlign: 'center', boxSizing: 'border-box',
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          <h3 style={{ color: '#34d399', fontSize: '24px', marginBottom: '20px' }}>선택 결과</h3>
          <p style={{ fontSize: '18px', color: '#ecfdf5', lineHeight: '1.6', marginBottom: '30px' }}>
            {resultText}
          </p>
          <button
            onClick={handleCloseResult}
            style={{
              padding: '12px 40px', fontSize: '20px', fontWeight: 'bold',
              backgroundColor: '#10b981', color: '#fff', border: 'none',
              borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            기록을 갈무리하고 길을 떠난다
          </button>
        </div>
      )}

      {/* 이벤트 도중 카드 액션 트리거 시 마운트되는 부가 모달 */}
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
