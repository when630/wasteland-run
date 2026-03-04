import { create } from 'zustand';

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
const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const useAudioStore = create<AudioState>((set, get) => ({
  bgmVolume: 0.3,
  sfxVolume: 0.5,
  currentBgmAudio: null,
  currentBgmTrack: null,

  setBgmVolume: (vol: number) => {
    set({ bgmVolume: vol });
    const { currentBgmAudio } = get();
    if (currentBgmAudio) {
      currentBgmAudio.volume = vol;
    }
  },

  setSfxVolume: (vol: number) => set({ sfxVolume: vol }),

  playBgm: (track) => {
    const { currentBgmAudio, currentBgmTrack, bgmVolume } = get();
    const targetUrl = BGM_TRACKS[track];

    if (currentBgmTrack === track && currentBgmAudio) {
      if (currentBgmAudio.paused) currentBgmAudio.play().catch(() => { });
      return;
    }

    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio.currentTime = 0;
    }

    const newAudio = new Audio(targetUrl);
    newAudio.loop = true;
    newAudio.volume = bgmVolume;
    newAudio.play().catch(e => console.warn("BGM 재생 실패 (파일 부재 혹은 브라우저 정책):", e));

    set({ currentBgmAudio: newAudio, currentBgmTrack: track });
  },

  stopBgm: () => {
    const { currentBgmAudio } = get();
    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio.currentTime = 0;
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
    const bufferSize = ctx.sampleRate * 0.2; // 0.2초
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // 화이트 노이즈
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

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
