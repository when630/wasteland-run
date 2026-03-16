import React, { useState, useRef, useEffect } from 'react';
import { useAudioStore } from '../../store/useAudioStore';
import { useRunStore } from '../../store/useRunStore';
import { useMapStore } from '../../store/useMapStore';
import { iconSettings, iconSoundTest, iconClose } from '../../assets/images/GUI';

interface SettingsModalProps {
  onClose: () => void;
  showQuitButton?: boolean;
}

const RESOLUTION_OPTIONS = [
  { label: '1280 x 720 (16:9)', width: 1280, height: 720 },
  { label: '1280 x 800 (16:10)', width: 1280, height: 800 },
  { label: '1366 x 768 (16:9)', width: 1366, height: 768 },
  { label: '1440 x 900 (16:10)', width: 1440, height: 900 },
  { label: '1600 x 900 (16:9)', width: 1600, height: 900 },
  { label: '1680 x 1050 (16:10)', width: 1680, height: 1050 },
  { label: '1920 x 1080 (16:9)', width: 1920, height: 1080 },
  { label: '1920 x 1200 (16:10)', width: 1920, height: 1200 },
  { label: '2560 x 1440 (16:9)', width: 2560, height: 1440 },
  { label: '2560 x 1600 (16:10)', width: 2560, height: 1600 },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, showQuitButton = false }) => {
  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume, playClick, playHit } = useAudioStore();
  const { saveRunData, isActive, runSeed, setScene, setToastMessage } = useRunStore();
  const [quitConfirm, setQuitConfirm] = useState(false);
  const quitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // 풀스크린 상태 초기화
  useEffect(() => {
    window.electronAPI?.getFullscreen().then((fs: boolean) => setIsFullscreen(fs));
  }, []);

  const handleFullscreenToggle = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    window.electronAPI?.setFullscreen(newState);
  };

  // 현재 창 크기에 가장 가까운 해상도 옵션 찾기
  const [selectedResolution, setSelectedResolution] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const match = RESOLUTION_OPTIONS.find(r => r.width === w && r.height === h);
    return match ? match.label : `${w} x ${h}`;
  });

  const handleResolutionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = RESOLUTION_OPTIONS.find(r => r.label === e.target.value);
    if (selected) {
      setSelectedResolution(selected.label);
      await window.electronAPI?.setResolution(selected.width, selected.height);
      // 해상도를 설정에 저장
      const { bgmVolume: bgm, sfxVolume: sfx } = useAudioStore.getState();
      window.electronAPI?.saveSettings({ bgmVolume: bgm, sfxVolume: sfx, resolutionWidth: selected.width, resolutionHeight: selected.height });
    }
  };

  const handleQuitToMain = async () => {
    if (!quitConfirm) {
      setQuitConfirm(true);
      setToastMessage('한 번 더 누르면 메인 메뉴로 돌아갑니다.');
      if (quitTimerRef.current) clearTimeout(quitTimerRef.current);
      quitTimerRef.current = setTimeout(() => setQuitConfirm(false), 3000);
      return;
    }
    if (quitTimerRef.current) clearTimeout(quitTimerRef.current);
    if (isActive) {
      await saveRunData();
    }
    useMapStore.getState().setPendingNode(null);
    setToastMessage('진행 상황이 저장되었습니다.');
    onClose();
    setScene('MAIN_MENU');
  };

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
    padding: '40px',
    width: 'min(400px, 90vw)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)',
    boxSizing: 'border-box',
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '32px',
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

  const btnStyle = (_bg: string, color: string = '#ff6666'): React.CSSProperties => ({
    padding: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'none',
    color,
    border: '1px solid rgba(255, 80, 80, 0.4)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
  });

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '16px',
    fontFamily: '"Courier New", Courier, monospace',
    backgroundColor: '#222',
    color: '#ddd',
    border: '1px solid #555',
    borderRadius: '6px',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, position: 'relative' }}>
        <button
          onClick={() => { playClick(); onClose(); }}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer', zIndex: 1,
          }}
        >
          <img src={iconClose} alt="닫기" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        </button>
        <h2 style={{ ...titleStyle, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <img src={iconSettings} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> 환경 설정
        </h2>

        {isActive && runSeed && (
          <div style={{ textAlign: 'center', color: '#ffaaaa', fontSize: '14px', marginBottom: '-10px' }}>
            현재 시드 (Seed): <span style={{ fontFamily: 'monospace', padding: '2px 6px', background: '#333', borderRadius: '4px' }}>{runSeed}</span>
          </div>
        )}

        {/* 해상도 설정 */}
        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>해상도 (Resolution)</span>
          </div>
          <select
            value={selectedResolution}
            onChange={handleResolutionChange}
            style={selectStyle}
          >
            {RESOLUTION_OPTIONS.map(r => (
              <option key={r.label} value={r.label}>{r.label}</option>
            ))}
            {/* 현재 해상도가 프리셋에 없으면 표시 */}
            {!RESOLUTION_OPTIONS.find(r => r.label === selectedResolution) && (
              <option value={selectedResolution} disabled>{selectedResolution} (현재)</option>
            )}
          </select>
        </div>

        {/* 풀스크린 토글 */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isFullscreen}
            onChange={handleFullscreenToggle}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#888' }}
          />
          <span style={{ fontSize: '18px', color: '#aaa', fontWeight: 'bold' }}>풀스크린 (Fullscreen)</span>
          <span style={{ fontSize: '13px', color: '#666', marginLeft: 'auto' }}>F11</span>
        </label>

        {/* 오디오 설정 */}
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
            style={sliderStyle}
          />
          <button
            onClick={() => playHit()}
            style={{
              marginTop: '5px', padding: '5px', fontSize: '14px',
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

        {/* 버튼 영역 */}
        <div style={buttonContainerStyle}>
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
  );
};
