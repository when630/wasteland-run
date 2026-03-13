import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useMapStore } from '../store/useMapStore';
import { STARTING_EVENTS } from '../assets/data/events';
import type { RandomEvent, EventOption } from '../types/eventTypes';
import { useRngStore } from '../store/useRngStore';
import eventBg from '../assets/images/backgrounds/event_map_background.webp';
import { iconEvent } from '../assets/images/GUI';
import { useResponsive } from '../hooks/useResponsive';

export const StartingEventView: React.FC = () => {
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;
  const { setScene } = useRunStore();
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  useEffect(() => {
    const eventRng = useRngStore.getState().eventRng;
    const pick = STARTING_EVENTS[eventRng.nextInt(STARTING_EVENTS.length)];
    setCurrentEvent(pick);
  }, []);

  if (!currentEvent) return null;

  const handleOptionSelect = (option: EventOption) => {
    const result = option.onSelect();
    setResultText(result);
  };

  const handleContinue = async () => {
    useMapStore.setState({ currentFloor: 1 });
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
      justifyContent: isMobile ? 'flex-start' : 'center',
      overflowY: 'auto', padding: isMobile ? '32px 0 48px' : '40px 0',
    }}>
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
          fontSize: isShortScreen ? '13px' : isMobile ? '14px' : '17px',
          color: '#ccc0a8', lineHeight: isShortScreen ? '1.4' : '1.7',
          marginBottom: isShortScreen ? '6px' : '12px',
          textShadow: txtShadowSub,
        }}>
          {currentEvent.description}
        </p>
        <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#8a7e6a', fontStyle: 'italic', textShadow: txtShadowSub }}>
          {currentEvent.visualDesc}
        </p>
      </div>

      {/* 구분선 */}
      <div style={{ width: isMobile ? '80vw' : '500px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 168, 84, 0.3), transparent)', marginBottom: isShortScreen ? '8px' : '16px' }} />

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
          <h3 style={{ color: '#d4a854', fontSize: isShortScreen ? '16px' : isMobile ? '18px' : '22px', marginBottom: isShortScreen ? '6px' : '14px', textShadow: txtShadow }}>출발 준비 완료</h3>
          <p style={{ fontSize: isShortScreen ? '13px' : isMobile ? '14px' : '16px', color: '#ccc0a8', lineHeight: '1.6', marginBottom: isShortScreen ? '12px' : '24px', textShadow: txtShadowSub }}>
            {resultText}
          </p>
          <button
            onClick={handleContinue}
            style={{
              padding: isShortScreen ? '8px 24px' : isMobile ? '10px 32px' : '12px 40px',
              fontSize: isShortScreen ? '14px' : isMobile ? '15px' : '18px', fontWeight: 'bold',
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
    </div>
  );
};
