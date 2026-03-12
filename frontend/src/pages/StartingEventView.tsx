import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useMapStore } from '../store/useMapStore';
import { STARTING_EVENTS } from '../assets/data/events';
import type { RandomEvent, EventOption } from '../types/eventTypes';
import { useRngStore } from '../store/useRngStore';
import eventBg from '../assets/images/backgrounds/event_map_background.png';
import { iconEvent } from '../assets/images/GUI';
import { useResponsive } from '../hooks/useResponsive';

export const StartingEventView: React.FC = () => {
  const { isMobile } = useResponsive();
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
                </div>
                <div style={{ fontSize: '14px', color: isDisabled ? '#5a5040' : '#a09880', lineHeight: '1.4' }}>{option.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'rgba(40, 30, 10, 0.9)',
          padding: isMobile ? '20px' : '30px', borderRadius: '8px',
          border: '1px solid rgba(212, 168, 84, 0.4)',
          borderLeft: '3px solid #d4a854',
          maxWidth: '600px', width: isMobile ? '90vw' : undefined, textAlign: 'center', boxSizing: 'border-box',
          boxShadow: '0 0 25px rgba(212, 168, 84, 0.15)',
          animation: 'slideUp 0.4s ease-out',
        }}>
          <h3 style={{ color: '#d4a854', fontSize: '22px', marginBottom: '16px', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>출발 준비 완료</h3>
          <p style={{ fontSize: '16px', color: '#ccc0a8', lineHeight: '1.6', marginBottom: '25px' }}>
            {resultText}
          </p>
          <button
            onClick={handleContinue}
            style={{
              padding: '12px 40px', fontSize: '18px', fontWeight: 'bold',
              backgroundColor: 'rgba(80, 55, 15, 0.9)', color: '#e8dcc8',
              border: '1px solid rgba(212, 168, 84, 0.5)',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(100, 70, 20, 0.95)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 168, 84, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(80, 55, 15, 0.9)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            황무지로 출발한다
          </button>
        </div>
      )}
    </div>
  );
};
