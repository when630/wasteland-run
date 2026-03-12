import React, { useEffect, useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { iconToast } from '../../assets/images/GUI';
import { useResponsive } from '../../hooks/useResponsive';

export const ToastMessage: React.FC = () => {
  const { toastMessage, setToastMessage } = useRunStore();
  const { isMobile } = useResponsive();
  const [isVisible, setIsVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState('');

  useEffect(() => {
    if (toastMessage) {
      setDisplayMsg(toastMessage);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2500);

      const clearTimer = setTimeout(() => {
        setToastMessage(null);
      }, 2800);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage && !isVisible) return null;

  const isWarning = /!|부족|불가|없|실패/.test(displayMsg);
  const isSuccess = /발동|획득|회복|완료|수신/.test(displayMsg);

  let bgColor: string;
  let borderColor: string;
  let glowColor: string;

  if (isWarning) {
    bgColor = 'rgba(80, 20, 15, 0.95)';
    borderColor = '#cc4433';
    glowColor = 'rgba(200, 60, 40, 0.4)';
  } else if (isSuccess) {
    bgColor = 'rgba(20, 60, 30, 0.95)';
    borderColor = '#44aa66';
    glowColor = 'rgba(60, 180, 80, 0.4)';
  } else {
    bgColor = 'rgba(60, 45, 15, 0.95)';
    borderColor = '#aa8833';
    glowColor = 'rgba(180, 140, 40, 0.4)';
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: bgColor,
        color: '#e8dcc8',
        padding: isMobile ? '10px 16px' : '14px 28px',
        borderRadius: '4px',
        fontSize: isMobile ? '14px' : '17px',
        maxWidth: isMobile ? '90vw' : undefined,
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        boxShadow: `0 0 20px ${glowColor}, 0 4px 15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${borderColor}`,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        animation: isVisible ? 'slideDown 0.3s ease-out' : undefined,
        textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
      }}
    >
      <img src={iconToast} alt="" style={{ width: 20, height: 20, objectFit: 'contain', verticalAlign: 'middle', marginRight: '8px', filter: 'drop-shadow(0 0 3px rgba(255,180,60,0.5))' }} />
      {displayMsg}
    </div>
  );
};
