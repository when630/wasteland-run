import { create } from 'zustand';
import { platformSaveRun, platformLoadRun, platformSubmitStats } from '../api/platform';

interface RunState {
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  currentMapNode: string | null;
  currentScene: 'MAIN_MENU' | 'MAP' | 'BATTLE' | 'ELITE' | 'REST' | 'EVENT' | 'SHOP' | 'BOSS' | 'DEBUG_BATTLE' | 'STARTING_EVENT' | 'TREASURE';
  currentChapter: number; // 현재 챕터 (1~3)
  relics: string[];
  toastMessage: string | null; // 🌟 전역 알림 메시지 상태
  runStartTime: number;
  runSeed: string; // 🌟 런 시드 (보존용)
  isActive: boolean; // 🌟 런 진행 여부
  isLeaderboardOpen: boolean; // 🌟 명예의 전당 모달 상태
  enemiesKilled: number; // 🌟 처치한 적 수
  cardsPlayed: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalGoldEarned: number;

  // Actions
  healPlayer: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addGold: (amount: number) => void;
  setMapNode: (nodeId: string | null) => void;
  setScene: (scene: RunState['currentScene']) => void; // 🌟 씬 전환 액션
  setChapter: (chapter: number) => void; // 챕터 전환
  addRelic: (relicId: string) => void; // 🌟 유물 추가 액션
  removeRelic: (relicId: string) => void; // 🌟 유물 제거 액션 (1회용 소모)
  setToastMessage: (msg: string | null) => void; // 🌟 토스트 메시지 액션
  setIsActive: (active: boolean) => void;
  setIsLeaderboardOpen: (isOpen: boolean) => void;
  addEnemiesKilled: (count: number) => void; // 🌟 적 처치 시 호출
  addCardsPlayed: (count: number) => void;
  addDamageDealt: (amount: number) => void;
  addDamageTaken: (amount: number) => void;
  addGoldEarned: (amount: number) => void;
  submitRunStats: (cleared: boolean) => Promise<void>;
  saveRunData: () => Promise<void>;
  loadRunData: () => Promise<void>;
}

export const useRunStore = create<RunState>((set) => ({
  playerHp: 84,
  playerMaxHp: 84,
  gold: 0,
  currentMapNode: null,
  currentScene: 'MAIN_MENU', // 기본 씬은 메인 메뉴로 시작
  currentChapter: 1,
  relics: [],
  toastMessage: null,
  runStartTime: Date.now(), // 런 시작 시간을 현재로 초기화
  runSeed: Math.random().toString(36).substring(2, 10), // 기본 무작위 시드
  isActive: false, // 🌟 기본값 false: loadRunData가 완료되어야만 true로 세팅
  isLeaderboardOpen: false,
  enemiesKilled: 0,
  cardsPlayed: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalGoldEarned: 0,

  healPlayer: (amount: number) => set((state) => ({
    playerHp: Math.min(state.playerHp + amount, state.playerMaxHp)
  })),

  damagePlayer: (amount: number) => set((state) => ({
    playerHp: Math.max(state.playerHp - amount, 0)
  })),

  addGold: (amount: number) => set((state) => ({
    gold: state.gold + amount,
    totalGoldEarned: amount > 0 ? state.totalGoldEarned + amount : state.totalGoldEarned
  })),

  setMapNode: (nodeId: string | null) => set({
    currentMapNode: nodeId
  }),

  setScene: (scene) => set({
    currentScene: scene
  }),

  setChapter: (chapter: number) => set({ currentChapter: chapter }),

  addRelic: (relicId) => set((state) => ({
    relics: [...state.relics, relicId]
  })),

  removeRelic: (relicId) => set((state) => ({
    relics: state.relics.filter(id => id !== relicId)
  })),

  setToastMessage: (msg) => set({ toastMessage: msg }),

  setIsActive: (active: boolean) => set({ isActive: active }),

  setIsLeaderboardOpen: (isOpen: boolean) => set({ isLeaderboardOpen: isOpen }),

  addEnemiesKilled: (count: number) => set((state) => ({ enemiesKilled: state.enemiesKilled + count })),

  addCardsPlayed: (count: number) => set((state) => ({ cardsPlayed: state.cardsPlayed + count })),
  addDamageDealt: (amount: number) => set((state) => ({ totalDamageDealt: state.totalDamageDealt + amount })),
  addDamageTaken: (amount: number) => set((state) => ({ totalDamageTaken: state.totalDamageTaken + amount })),
  addGoldEarned: (amount: number) => set((state) => ({ totalGoldEarned: state.totalGoldEarned + amount })),

  submitRunStats: async (cleared: boolean) => {
    try {
      const { useMapStore } = await import('./useMapStore');
      const { useDeckStore } = await import('./useDeckStore');
      const currentState = useRunStore.getState();
      const currentFloor = useMapStore.getState().currentFloor;
      const masterDeck = useDeckStore.getState().masterDeck;

      // 카드 사용 빈도 맵 생성 (masterDeck 기반 — 보유 카드 수로 근사)
      const cardUsageMap: Record<string, number> = {};
      masterDeck.forEach(card => {
        cardUsageMap[card.name] = (cardUsageMap[card.name] || 0) + 1;
      });

      // 유물 빈도 맵
      const relicUsageMap: Record<string, number> = {};
      currentState.relics.forEach(relic => {
        relicUsageMap[relic] = (relicUsageMap[relic] || 0) + 1;
      });

      await platformSubmitStats({
        enemiesKilled: currentState.enemiesKilled,
        damageDealt: currentState.totalDamageDealt,
        damageTaken: currentState.totalDamageTaken,
        cardsPlayed: currentState.cardsPlayed,
        goldEarned: currentState.totalGoldEarned,
        reachedFloor: currentFloor,
        cleared,
        cardUsageMap,
        relicUsageMap,
      });
    } catch (e) {
      console.error('런 통계 제출 실패', e);
    }
  },

  saveRunData: async () => {
    try {
      // 덱과 유물 정보 등은 다른 store에서 가져와야 하므로 getState()를 통해 동적으로 취합
      const { useDeckStore } = await import('./useDeckStore');
      const { useMapStore } = await import('./useMapStore');

      const currentState = useRunStore.getState();
      const currentDeck = useDeckStore.getState().masterDeck;
      const currentLayer = useMapStore.getState().currentFloor;

      const mapState = useMapStore.getState();
      const mapJson = JSON.stringify({
        nodes: mapState.nodes,
        currentNodeId: mapState.currentNodeId,
        visitedNodeIds: mapState.visitedNodeIds,
        mapChapter: mapState.mapChapter
      });

      await platformSaveRun({
        currentHp: currentState.playerHp,
        maxHp: currentState.playerMaxHp,
        currentLayer: currentLayer,
        gold: currentState.gold,
        deckJson: JSON.stringify(currentDeck),
        relicsJson: JSON.stringify(currentState.relics),
        runSeed: currentState.runSeed,
        currentScene: currentState.currentScene,
        currentMapNode: currentState.currentMapNode || '',
        isActive: currentState.isActive,
        currentChapter: currentState.currentChapter,
        enemiesKilled: currentState.enemiesKilled,
        cardsPlayed: currentState.cardsPlayed,
        totalDamageDealt: currentState.totalDamageDealt,
        totalDamageTaken: currentState.totalDamageTaken,
        totalGoldEarned: currentState.totalGoldEarned,
        mapJson
      });
      // 저장 성공 시 조용히 넘김
    } catch {
      // 백엔드 미연결 시 조용히 무시 (로컬 상태로 정상 진행)
    }
  },

  loadRunData: async () => {
    try {
      const data = await platformLoadRun();
      if (data && data.isActive) {
        set({
          playerHp: data.currentHp,
          playerMaxHp: data.maxHp,
          gold: data.gold,
          relics: data.relicsJson ? JSON.parse(data.relicsJson) : [],
          runSeed: data.runSeed || Math.random().toString(36).substring(2, 10),
          currentScene: 'MAIN_MENU', // 🌟 항상 메인 메뉴에서 시작 → "이어하기" 버튼을 통해 진입
          currentMapNode: data.currentMapNode || null,
          currentChapter: data.currentChapter || 1,
          isActive: data.isActive,
          enemiesKilled: data.enemiesKilled || 0,
          cardsPlayed: data.cardsPlayed || 0,
          totalDamageDealt: data.totalDamageDealt || 0,
          totalDamageTaken: data.totalDamageTaken || 0,
          totalGoldEarned: data.totalGoldEarned || 0
        });

        // 다른 스토어 상태도 복원
        const { useDeckStore } = await import('./useDeckStore');
        const { useMapStore } = await import('./useMapStore');

        if (data.deckJson) {
          useDeckStore.getState().setMasterDeck(JSON.parse(data.deckJson));
        }

        useMapStore.setState({ currentFloor: data.currentLayer, pendingNodeId: null });

        // 맵 상태 복원
        if (data.mapJson) {
          try {
            const mapData = JSON.parse(data.mapJson);
            const savedMapChapter = mapData.mapChapter || 1;
            const loadedChapter = data.currentChapter || 1;
            // 저장된 맵의 챕터가 현재 챕터와 일치하면 복원, 아니면 빈 상태로 두어 MapView에서 재생성
            if (savedMapChapter === loadedChapter && mapData.nodes?.length > 0) {
              useMapStore.setState({
                nodes: mapData.nodes,
                currentNodeId: mapData.currentNodeId || null,
                visitedNodeIds: mapData.visitedNodeIds || [],
                pendingNodeId: null,
                mapChapter: savedMapChapter
              });
            } else {
              useMapStore.setState({
                nodes: [], currentNodeId: null, visitedNodeIds: [],
                pendingNodeId: null, mapChapter: loadedChapter
              });
            }
          } catch (e) {
            console.warn('맵 데이터 파싱 실패, 맵을 새로 생성합니다.', e);
          }
        }

        // 시드 RNG 초기화 (저장된 시드 기반)
        const rngModule = await import('./useRngStore');
        rngModule.useRngStore.getState().initialize(data.runSeed || Math.random().toString(36).substring(2, 10));

        useRunStore.getState().setToastMessage('데이터 수신 완료 — 탐험을 이어갑니다.');
      } else if (data && !data.isActive) {
        console.log('이전 런이 종료된 상태입니다. 새 게임을 시작합니다.');
        set({ currentScene: 'MAIN_MENU', isActive: false, enemiesKilled: 0, cardsPlayed: 0, totalDamageDealt: 0, totalDamageTaken: 0, totalGoldEarned: 0 });
      }
    } catch {
      // 백엔드 미연결 — 로컬 새 게임으로 시작
      set({ currentScene: 'MAIN_MENU', isActive: false, enemiesKilled: 0, cardsPlayed: 0, totalDamageDealt: 0, totalDamageTaken: 0, totalGoldEarned: 0 });
    }
  }
}));
