import { create } from 'zustand';

// 설정 로컬 저장 (디바운스)
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function saveSettingsDebounced(bgmVolume: number, sfxVolume: number) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    // 기존 설정 로드 후 오디오 값만 업데이트 (해상도 등 다른 설정 보존)
    const existing = (await window.electronAPI?.loadSettings()) as Record<string, any> | null;
    window.electronAPI?.saveSettings({ ...existing, bgmVolume, sfxVolume });
  }, 500);
}

// BGM 목록 (파일이 없으면 404 에러 로그만 남고 게임은 정상 진행됨)
const BGM_TRACKS = {
  MAIN: '/assets/sounds/bgm_main.mp3',
  MAP: '/assets/sounds/bgm_map.mp3',
  BATTLE: '/assets/sounds/bgm_battle.mp3',
  BOSS: '/assets/sounds/bgm_boss.mp3',
};

interface AudioState {
  bgmVolume: number;
  sfxVolume: number;
  currentBgmAudio: HTMLAudioElement | null;
  currentBgmTrack: string | null;

  setBgmVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  playBgm: (track: keyof typeof BGM_TRACKS) => void;
  stopBgm: () => void;

  // SFX (Web Audio API 기반 합성음)
  playClick: () => void;
  playHit: () => void;
  playDraw: () => void;
  playHeal: () => void;
}

// 오디오 컨텍스트 지연 초기화 (상호작용 전 생성 시 경고 방지)
let audioCtx: AudioContext | null = null;
let hitNoiseBuffer: AudioBuffer | null = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const getHitNoiseBuffer = () => {
  const ctx = getAudioCtx();
  if (!hitNoiseBuffer || hitNoiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.2);
    hitNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = hitNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  }
  return hitNoiseBuffer;
};

// 사용자 상호작용 감지 — 브라우저 자동재생 정책 우회
let userHasInteracted = false;
let pendingBgmTrack: keyof typeof BGM_TRACKS | null = null;

function onFirstInteraction() {
  if (userHasInteracted) return;
  userHasInteracted = true;
  window.removeEventListener('click', onFirstInteraction);
  window.removeEventListener('keydown', onFirstInteraction);
  // 대기 중인 BGM 재생
  if (pendingBgmTrack) {
    useAudioStore.getState().playBgm(pendingBgmTrack);
    pendingBgmTrack = null;
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('click', onFirstInteraction);
  window.addEventListener('keydown', onFirstInteraction);
}

export const useAudioStore = create<AudioState>((set, get) => ({
  bgmVolume: 0.3,
  sfxVolume: 0.5,
  currentBgmAudio: null,
  currentBgmTrack: null,

  setBgmVolume: (vol: number) => {
    set({ bgmVolume: vol });
    const { currentBgmAudio, sfxVolume } = get();
    if (currentBgmAudio) {
      currentBgmAudio.volume = vol;
    }
    saveSettingsDebounced(vol, sfxVolume);
  },

  setSfxVolume: (vol: number) => {
    set({ sfxVolume: vol });
    saveSettingsDebounced(get().bgmVolume, vol);
  },

  playBgm: (track) => {
    // 사용자 상호작용 전이면 대기열에 저장
    if (!userHasInteracted) {
      pendingBgmTrack = track;
      return;
    }

    const { currentBgmAudio, currentBgmTrack, bgmVolume } = get();
    const targetUrl = BGM_TRACKS[track];

    if (currentBgmTrack === track && currentBgmAudio) {
      if (currentBgmAudio.paused) currentBgmAudio.play().catch(() => { });
      return;
    }

    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio.removeAttribute('src');
      currentBgmAudio.load();
    }

    const newAudio = new Audio(targetUrl);
    newAudio.loop = true;
    newAudio.volume = bgmVolume;
    newAudio.play().catch(() => { /* 파일 부재 시 무시 */ });

    set({ currentBgmAudio: newAudio, currentBgmTrack: track });
  },

  stopBgm: () => {
    const { currentBgmAudio } = get();
    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio.removeAttribute('src');
      currentBgmAudio.load();
    }
    set({ currentBgmAudio: null, currentBgmTrack: null });
  },

  // UI 버튼 클릭 효과음 (짧은 띡 소리)
  playClick: () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(get().sfxVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  },

  // 둔탁한 타격음 (금속/살점 타격 연출용 노이즈)
  playHit: () => {
    const ctx = getAudioCtx();
    const noise = ctx.createBufferSource();
    noise.buffer = getHitNoiseBuffer();

    // 로우패스 필터로 둔탁하게 깎음
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(get().sfxVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
  },

  // 화면 전환 / 카드 드로우 스르륵 소리
  playDraw: () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(get().sfxVolume * 0.5, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },

  // 회복 효과음 (띠로링 기분좋은 소리)
  playHeal: () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(get().sfxVolume * 0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }
}));
