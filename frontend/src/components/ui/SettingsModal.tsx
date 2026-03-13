import React, { useState, useRef } from 'react';
import { useAudioStore } from '../../store/useAudioStore';
import { useRunStore } from '../../store/useRunStore';
import { useMapStore } from '../../store/useMapStore';
import { iconSettings, iconSoundTest, iconClose } from '../../assets/images/GUI';
import { useResponsive } from '../../hooks/useResponsive';

interface SettingsModalProps {
  onClose: () => void;
  showQuitButton?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, showQuitButton = false }) => {
  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume, playClick, playHit } = useAudioStore();
  const { saveRunData, isActive, runSeed, setScene, setToastMessage } = useRunStore();
  const { isMobile, height } = useResponsive();
  const isShortScreen = height < 500;
  const [quitConfirm, setQuitConfirm] = useState(false);
  const quitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQuitToMain = async () => {
    if (!quitConfirm) {
      // 첫 번째 클릭: 토스트로 안내, 확인 대기 상태로 전환
      setQuitConfirm(true);
      setToastMessage('한 번 더 누르면 메인 메뉴로 돌아갑니다.');
      // 3초 안에 다시 안 누르면 초기화
      if (quitTimerRef.current) clearTimeout(quitTimerRef.current);
      quitTimerRef.current = setTimeout(() => setQuitConfirm(false), 3000);
      return;
    }
    // 두 번째 클릭: 실제 나가기
    if (quitTimerRef.current) clearTimeout(quitTimerRef.current);
    if (isActive) {
      await saveRunData();
    }
    useMapStore.getState().setPendingNode(null); // 잔여 pendingNodeId 클리어
    setToastMessage('진행 상황이 저장되었습니다.');
    onClose();
    setScene('MAIN_MENU');
  };

  // --- Styled Components --- //
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.90)',
    zIndex: 20000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Courier New", Courier, monospace',
    color: '#fff',
    animation: 'fadeIn 0.2s ease-out'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#111',
    border: '2px solid #555',
    borderRadius: '12px',
    padding: isShortScreen ? '16px 24px' : isMobile ? '24px' : '40px',
    width: isShortScreen ? 'min(700px, 95vw)' : 'min(400px, 90vw)',
    maxHeight: isShortScreen ? '90vh' : undefined,
    overflowY: isShortScreen ? 'auto' : undefined,
    display: 'flex',
    flexDirection: 'column',
    gap: isShortScreen ? '12px' : '24px',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)',
    boxSizing: 'border-box',
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: isShortScreen ? '18px' : isMobile ? '24px' : '32px',
    color: '#ccc',
    textAlign: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: isShortScreen ? '8px' : '15px'
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: isShortScreen ? '4px' : '10px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: isShortScreen ? '14px' : '20px',
    fontWeight: 'bold',
    color: '#aaa',
    display: 'flex',
    justifyContent: 'space-between'
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    cursor: 'pointer'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isShortScreen ? 'row' : 'column',
    gap: isShortScreen ? '10px' : '15px',
    marginTop: isShortScreen ? '4px' : '20px'
  };

  const btnStyle = (_bg: string, color: string = '#ff6666'): React.CSSProperties => ({
    padding: isShortScreen ? '8px 12px' : '12px',
    fontSize: isShortScreen ? '14px' : '18px',
    fontWeight: 'bold',
    background: 'none',
    color,
    border: '1px solid rgba(255, 80, 80, 0.4)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
    flex: isShortScreen ? 1 : undefined,
  });

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, position: 'relative' }}>
        <button
          onClick={() => { playClick(); onClose(); }}
          style={{
            position: 'absolute', top: isShortScreen ? 8 : 12, right: isShortScreen ? 8 : 12,
            background: 'none', border: 'none', cursor: 'pointer', zIndex: 1,
          }}
        >
          <img src={iconClose} alt="닫기" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        </button>
        <h2 style={{ ...titleStyle, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <img src={iconSettings} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> 환경 설정
        </h2>

        {isActive && runSeed && !isShortScreen && (
          <div style={{ textAlign: 'center', color: '#ffaaaa', fontSize: '14px', marginBottom: '-10px' }}>
            현재 시드 (Seed): <span style={{ fontFamily: 'monospace', padding: '2px 6px', background: '#333', borderRadius: '4px' }}>{runSeed}</span>
          </div>
        )}

        <div style={isShortScreen ? { display: 'flex', gap: '20px' } : undefined}>
          {/* 슬라이더 영역 */}
          <div style={isShortScreen ? { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' } : undefined}>
            <div style={rowStyle}>
              <div style={labelStyle}>
                <span>배경음악 (BGM)</span>
                <span>{Math.round(bgmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={bgmVolume}
                onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                style={sliderStyle}
              />
            </div>

            <div style={rowStyle}>
              <div style={labelStyle}>
                <span>효과음 (SFX)</span>
                <span>{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={sfxVolume}
                onChange={(e) => {
                  setSfxVolume(parseFloat(e.target.value));
                }}
                onMouseUp={() => playClick()}
                onTouchEnd={() => playClick()}
                style={sliderStyle}
              />
              <button
                onClick={() => playHit()}
                style={{
                  marginTop: isShortScreen ? '2px' : '5px', padding: '5px', fontSize: isShortScreen ? '12px' : '14px',
                  background: 'none', color: '#a09078', border: '1px solid rgba(120, 100, 70, 0.4)',
                  borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
              >
                <img src={iconSoundTest} alt="" style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} /> 타격음 테스트
              </button>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div style={isShortScreen ? { ...buttonContainerStyle, flexDirection: 'column', flex: 'none', width: '180px', marginTop: 0 } : buttonContainerStyle}>
          {showQuitButton && (
            <button
              onClick={handleQuitToMain}
              style={btnStyle('#991b1b')}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 100, 100, 0.7)'; e.currentTarget.style.color = '#ff8888'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.4)'; e.currentTarget.style.color = '#ff6666'; }}
            >
              {quitConfirm ? '정말 나가시겠습니까?' : '메인 메뉴로 나가기 (저장됨)'}
            </button>
          )}

        </div>
        </div>

      </div>
    </div>
  );
};
