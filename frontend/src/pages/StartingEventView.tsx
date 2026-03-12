import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useMapStore } from '../store/useMapStore';
import { STARTING_EVENTS } from '../assets/data/events';
import type { RandomEvent, EventOption } from '../types/eventTypes';
import { useRngStore } from '../store/useRngStore';
import eventBg from '../assets/images/backgrounds/event_map_background.png';
import { iconEvent } from '../assets/images/GUI';

export const StartingEventView: React.FC = () => {
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
    // 0층 → 1층으로 진입, 맵 씬으로 전환
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
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: window.innerWidth < 768 ? '24px' : '48px', color: '#fbbf24', marginBottom: '10px', textAlign: 'center', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
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

      {!resultText ? (
        <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', width: window.innerWidth < 768 ? '90vw' : '600px' }}>
          {currentEvent.options.map((option, idx) => {
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
                </div>
                <div style={{ fontSize: '15px' }}>{option.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#064e3b', padding: window.innerWidth < 768 ? '20px' : '30px', borderRadius: '12px',
          border: '2px solid #10b981', maxWidth: '600px', width: window.innerWidth < 768 ? '90vw' : undefined, textAlign: 'center', boxSizing: 'border-box',
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          <h3 style={{ color: '#34d399', fontSize: '24px', marginBottom: '20px' }}>출발 준비 완료</h3>
          <p style={{ fontSize: '18px', color: '#ecfdf5', lineHeight: '1.6', marginBottom: '30px' }}>
            {resultText}
          </p>
          <button
            onClick={handleContinue}
            style={{
              padding: '12px 40px', fontSize: '20px', fontWeight: 'bold',
              backgroundColor: '#f59e0b', color: '#000', border: 'none',
              borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
          >
            황무지로 출발한다
          </button>
        </div>
      )}
    </div>
  );
};
