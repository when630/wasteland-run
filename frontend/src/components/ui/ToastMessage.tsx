import React, { useEffect, useState } from 'react';
import { useRunStore } from '../../store/useRunStore';
import { iconToast } from '../../assets/images/GUI';

export const ToastMessage: React.FC = () => {
  const { toastMessage, setToastMessage } = useRunStore();
  const [isVisible, setIsVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState('');

  useEffect(() => {
    if (toastMessage) {
      setDisplayMsg(toastMessage);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // 2초 표시

      // 애니메이션(0.3s)이 끝난 후 store 도 비움
      const clearTimer = setTimeout(() => {
        setToastMessage(null);
      }, 2300);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage && !isVisible) return null;

  // 메시지 내용에 따른 색상/아이콘 분기
  const isWarning = /!|부족|불가|없|실패/.test(displayMsg);
  const isSuccess = /발동|획득|회복|완료|수신/.test(displayMsg);

  let bgColor: string;
  let borderColor: string;

  if (isWarning) {
    bgColor = 'rgba(220, 50, 50, 0.95)';
    borderColor = '#ff8888';
  } else if (isSuccess) {
    bgColor = 'rgba(34, 130, 68, 0.95)';
    borderColor = '#66cc88';
  } else {
    bgColor = 'rgba(180, 140, 40, 0.95)';
    borderColor = '#ddb844';
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: bgColor,
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        border: `1px solid ${borderColor}`,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        marginTop: isVisible ? '0' : '-10px',
      }}
    >
      <img src={iconToast} alt="" style={{ width: 20, height: 20, objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }} />
      {displayMsg}
    </div>
  );
};
