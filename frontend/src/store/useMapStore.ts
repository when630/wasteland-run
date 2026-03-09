import { create } from 'zustand';

export type NodeType = 'BATTLE' | 'ELITE' | 'REST' | 'SHOP' | 'EVENT' | 'BOSS';

export interface MapNode {
  id: string;         // 고유 식별자 (예: 'f1-p0', 'f15-boss')
  floor: number;      // 맵의 깊이 (1~15)
  positionX: number;  // 층 내 위치 (0~6, 7열 그리드)
  type: NodeType;     // 노드 타입
  nextNodeIds: string[]; // 연결된 다음 노드들의 ID
}

interface MapState {
  nodes: MapNode[];
  currentNodeId: string | null;
  currentFloor: number;
  visitedNodeIds: string[];

  // Actions
  generateMap: () => void;
  moveToNode: (nodeId: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  nodes: [],
  currentNodeId: null,
  currentFloor: 1,
  visitedNodeIds: [],

  generateMap: () => {
    const TOTAL_FLOORS = 15;
    const COLUMNS = 7;
    const NUM_PATHS = 6;

    // 노드 타입 확률: 전투 45%, 이벤트 22%, 엘리트 16%, 휴식 12%, 상인 5%
    const getRandomType = (floor: number): NodeType => {
      if (floor === 1) return 'BATTLE';
      if (floor === TOTAL_FLOORS) return 'BOSS';
      if (floor === TOTAL_FLOORS - 1) return 'REST';
      if (floor === Math.floor(TOTAL_FLOORS / 2)) return 'ELITE';

      const r = Math.random();
      if (r < 0.45) return 'BATTLE';
      if (r < 0.67) return 'EVENT';
      if (r < 0.83) return 'ELITE';
      if (r < 0.95) return 'REST';
      return 'SHOP';
    };

    // --- (a) 경로 생성: 6개의 1층→14층 랜덤 워크 ---

    // 간선 교차 방지: 층 전이별 간선 기록
    const floorEdges = new Map<number, Array<[number, number]>>();

    const wouldCross = (floor: number, fromCol: number, toCol: number): boolean => {
      const edges = floorEdges.get(floor) || [];
      for (const [ef, et] of edges) {
        if ((fromCol < ef && toCol > et) || (fromCol > ef && toCol < et)) return true;
      }
      return false;
    };

    const addEdge = (floor: number, fromCol: number, toCol: number) => {
      if (!floorEdges.has(floor)) floorEdges.set(floor, []);
      const edges = floorEdges.get(floor)!;
      if (!edges.some(([f, t]) => f === fromCol && t === toCol)) {
        edges.push([fromCol, toCol]);
      }
    };

    // Fisher-Yates 셔플
    const shuffle = <T>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const paths: Array<Array<[number, number]>> = [];
    const usedStartCols = new Set<number>();

    for (let p = 0; p < NUM_PATHS; p++) {
      // 시작 열 선택 (처음 2개 경로는 서로 다른 시작점 보장)
      let startCol: number;
      if (p < 2) {
        do {
          startCol = Math.floor(Math.random() * COLUMNS);
        } while (p > 0 && usedStartCols.has(startCol));
        usedStartCols.add(startCol);
      } else {
        startCol = Math.floor(Math.random() * COLUMNS);
      }

      const path: Array<[number, number]> = [[1, startCol]];
      let currentCol = startCol;

      for (let floor = 2; floor <= TOTAL_FLOORS - 1; floor++) {
        // 인접 열 후보 (x-1, x, x+1)
        const options: number[] = [];
        if (currentCol > 0) options.push(currentCol - 1);
        options.push(currentCol);
        if (currentCol < COLUMNS - 1) options.push(currentCol + 1);

        // 셔플 후, 교차하지 않는 첫 번째 선택지 사용
        const shuffled = shuffle(options);
        let nextCol = shuffled[0];
        for (const opt of shuffled) {
          if (!wouldCross(floor - 1, currentCol, opt)) {
            nextCol = opt;
            break;
          }
        }

        addEdge(floor - 1, currentCol, nextCol);
        path.push([floor, nextCol]);
        currentCol = nextCol;
      }

      paths.push(path);
    }

    // --- (b) 노드 생성: 경로가 지나간 (층, 열)에만 노드 배치 ---
    const nodeMap = new Map<string, MapNode>();

    // 보스 노드 (15층 중앙)
    nodeMap.set(`${TOTAL_FLOORS}-3`, {
      id: `f${TOTAL_FLOORS}-boss`,
      floor: TOTAL_FLOORS,
      positionX: 3,
      type: 'BOSS',
      nextNodeIds: []
    });

    for (const path of paths) {
      for (const [floor, col] of path) {
        const key = `${floor}-${col}`;
        if (!nodeMap.has(key)) {
          nodeMap.set(key, {
            id: `f${floor}-p${col}`,
            floor,
            positionX: col,
            type: getRandomType(floor),
            nextNodeIds: []
          });
        }
      }
    }

    // --- (c) 간선 생성: 각 경로를 따라 노드 간 연결 ---
    const bossId = `f${TOTAL_FLOORS}-boss`;

    for (const path of paths) {
      for (let i = 0; i < path.length - 1; i++) {
        const [f1, c1] = path[i];
        const [f2, c2] = path[i + 1];
        const node1 = nodeMap.get(`${f1}-${c1}`)!;
        const node2Id = nodeMap.get(`${f2}-${c2}`)!.id;
        if (!node1.nextNodeIds.includes(node2Id)) {
          node1.nextNodeIds.push(node2Id);
        }
      }

      // 14층 → 15층 보스 연결
      const [lastFloor, lastCol] = path[path.length - 1];
      const lastNode = nodeMap.get(`${lastFloor}-${lastCol}`)!;
      if (!lastNode.nextNodeIds.includes(bossId)) {
        lastNode.nextNodeIds.push(bossId);
      }
    }

    const newNodes = Array.from(nodeMap.values());
    set({ nodes: newNodes, currentNodeId: null, currentFloor: 1, visitedNodeIds: [] });
  },

  moveToNode: (nodeId: string) => set((state) => {
    const targetNode = state.nodes.find(n => n.id === nodeId);
    if (!targetNode) return state;

    return {
      currentNodeId: nodeId,
      currentFloor: targetNode.floor,
      visitedNodeIds: [...state.visitedNodeIds, nodeId]
    };
  })
}));
