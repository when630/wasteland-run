import React, { useEffect, useState } from 'react';
import { useRunStore } from '../../store/useRunStore';

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
        // 애니메이션(0.3s)이 끝난 후 store 도 비움
        setTimeout(() => setToastMessage(null), 300);
      }, 2000); // 2초 표시

      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage && !isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20%', // 상단 중앙 부근에 배치
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(220, 50, 50, 0.95)', // 에러 계열의 붉은 색상
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        border: '1px solid #ff8888',
        zIndex: 9999, // 항상 최상단
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        // 등장 시 약간 움직이는 애니메이션 (기본 -50%에서 시작하므로 offsetY를 줌)
        marginTop: isVisible ? '0' : '-10px',
      }}
    >
      ⚠️ {displayMsg}
    </div>
  );
};
