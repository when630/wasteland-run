import React from 'react';
import { useAudioStore } from '../../store/useAudioStore';
import { useRunStore } from '../../store/useRunStore';
import { iconSettings } from '../../assets/images/GUI';
import { useResponsive } from '../../hooks/useResponsive';

interface SettingsModalProps {
  onClose: () => void;
  showQuitButton?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, showQuitButton = false }) => {
  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume, playClick, playHit } = useAudioStore();
  const { saveRunData, isActive, runSeed, setScene } = useRunStore();
  const { isMobile } = useResponsive();

  const handleQuitToMain = async () => {
    // 확인 후 메인 메뉴로 나가기 처리
    if (window.confirm('현재 게임 진행 상황을 저장하고 메인 메뉴로 돌아가시겠습니까?')) {
      if (isActive) {
        await saveRunData(); // 🌟 현재 진행 상황 서버에 저장
      }
      onClose(); // 설정 모달 닫기
      setScene('MAIN_MENU'); // 🌟 리로드 대신 씬 전환으로 메인 메뉴 이동
    }
  };

  // --- Styled Components --- //
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.90)',
    zIndex: 2000,
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
    padding: isMobile ? '24px' : '40px',
    width: 'min(400px, 90vw)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)',
    boxSizing: 'border-box',
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: isMobile ? '24px' : '32px',
    color: '#ccc',
    textAlign: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '15px'
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '20px',
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
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
  };

  const btnStyle = (bg: string, color: string = '#fff'): React.CSSProperties => ({
    padding: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: bg,
    color,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  });

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ ...titleStyle, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <img src={iconSettings} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> 환경 설정
        </h2>

        {isActive && runSeed && (
          <div style={{ textAlign: 'center', color: '#ffaaaa', fontSize: '14px', marginBottom: '-10px' }}>
            현재 시드 (Seed): <span style={{ fontFamily: 'monospace', padding: '2px 6px', background: '#333', borderRadius: '4px' }}>{runSeed}</span>
          </div>
        )}

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
            onMouseUp={() => playClick()}   // 드래그 후 놓았을 때 클릭음
            onTouchEnd={() => playClick()}  // 모바일 호환용
            style={sliderStyle}
          />
          <button
            onClick={() => playHit()}
            style={{
              marginTop: '5px', padding: '5px', fontSize: '14px',
              backgroundColor: '#333', color: '#ccc', border: '1px solid #555',
              borderRadius: '4px', cursor: 'pointer'
            }}
          >
            🔊 타격음 테스트
          </button>
        </div>

        <div style={buttonContainerStyle}>
          {showQuitButton && (
            <button
              onClick={handleQuitToMain}
              style={btnStyle('#991b1b')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#991b1b'}
            >
              메인 메뉴로 나가기 (저장됨)
            </button>
          )}

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            style={btnStyle('#374151')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          >
            ❌ 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
