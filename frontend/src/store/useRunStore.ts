import { create } from 'zustand';
import { authApi } from '../api/auth';

interface RunState {
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  currentMapNode: string | null;
  currentScene: 'MAP' | 'BATTLE' | 'ELITE' | 'REST' | 'EVENT' | 'SHOP' | 'BOSS'; // 🌟 씬 타입 확장
  relics: string[];
  toastMessage: string | null; // 🌟 전역 알림 메시지 상태
  runStartTime: number;
  runSeed: string; // 🌟 런 시드 (보존용)
  isActive: boolean; // 🌟 런 진행 여부

  // Actions
  healPlayer: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addGold: (amount: number) => void;
  setMapNode: (nodeId: string | null) => void;
  setScene: (scene: RunState['currentScene']) => void; // 🌟 씬 전환 액션
  addRelic: (relicId: string) => void; // 🌟 유물 추가 액션
  setToastMessage: (msg: string | null) => void; // 🌟 토스트 메시지 액션
  setIsActive: (active: boolean) => void;
  saveRunData: () => Promise<void>;
  loadRunData: () => Promise<void>;
}

export const useRunStore = create<RunState>((set) => ({
  playerHp: 50,
  playerMaxHp: 70,
  gold: 0,
  currentMapNode: null,
  currentScene: 'MAP', // 기본 씬은 맵으로 시작
  relics: [],
  toastMessage: null,
  runStartTime: Date.now(), // 런 시작 시간을 현재로 초기화
  runSeed: Math.random().toString(36).substring(2, 10), // 기본 무작위 시드
  isActive: true,

  healPlayer: (amount: number) => set((state) => ({
    playerHp: Math.min(state.playerHp + amount, state.playerMaxHp)
  })),

  damagePlayer: (amount: number) => set((state) => ({
    playerHp: Math.max(state.playerHp - amount, 0)
  })),

  addGold: (amount: number) => set((state) => ({
    gold: state.gold + amount
  })),

  setMapNode: (nodeId: string | null) => set({
    currentMapNode: nodeId
  }),

  setScene: (scene) => set({
    currentScene: scene
  }),

  addRelic: (relicId) => set((state) => ({
    relics: [...state.relics, relicId]
  })),

  setToastMessage: (msg) => set({ toastMessage: msg }),

  setIsActive: (active: boolean) => set({ isActive: active }),

  saveRunData: async () => {
    try {
      // 덱과 유물 정보 등은 다른 store에서 가져와야 하므로 getState()를 통해 동적으로 취합
      const { useDeckStore } = await import('./useDeckStore');
      const { useMapStore } = await import('./useMapStore');

      const currentState = useRunStore.getState();
      const currentDeck = useDeckStore.getState().masterDeck;
      const currentLayer = useMapStore.getState().currentFloor;

      await authApi.post('/run', {
        currentHp: currentState.playerHp,
        maxHp: currentState.playerMaxHp,
        currentLayer: currentLayer,
        gold: currentState.gold,
        deckJson: JSON.stringify(currentDeck),
        relicsJson: JSON.stringify(currentState.relics),
        runSeed: currentState.runSeed,
        currentScene: currentState.currentScene,
        currentMapNode: currentState.currentMapNode || '',
        isActive: currentState.isActive
      });
      // 저장 성공 시 조용히 넘김
    } catch (e) {
      console.error('Run Data 저장 실패', e);
    }
  },

  loadRunData: async () => {
    try {
      const { data } = await authApi.get('/run');
      if (data && data.isActive) {
        set({
          playerHp: data.currentHp,
          playerMaxHp: data.maxHp,
          gold: data.gold,
          relics: data.relicsJson ? JSON.parse(data.relicsJson) : [],
          runSeed: data.runSeed || Math.random().toString(36).substring(2, 10),
          currentScene: data.currentScene || 'MAP',
          currentMapNode: data.currentMapNode || null,
          isActive: data.isActive
        });

        // 다른 스토어 상태도 복원
        const { useDeckStore } = await import('./useDeckStore');
        const { useMapStore } = await import('./useMapStore');

        if (data.deckJson) {
          useDeckStore.getState().setMasterDeck(JSON.parse(data.deckJson));
        }

        useMapStore.setState({ currentFloor: data.currentLayer });
        useRunStore.getState().setToastMessage('진행 상황을 불러왔습니다.');
      } else if (data && !data.isActive) {
        console.log('이전 런이 종료된 상태입니다. 새 게임을 시작합니다.');
      }
    } catch (e) {
      console.warn('저장된 진행 상황을 찾지 못했습니다. 새로운 런을 시작합니다.', e);
    }
  }
}));
