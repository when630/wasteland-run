import { create } from 'zustand';
import { useRngStore } from './useRngStore';

export type NodeType = 'BATTLE' | 'ELITE' | 'REST' | 'SHOP' | 'EVENT' | 'BOSS';

export interface MapNode {
  id: string;         // 고유 식별자 (예: 'f1-p0', 'f15-boss')
  floor: number;      // 맵의 깊이 (1~15)
  positionX: number;  // 층 내 위치 (0~6, 7열 그리드)
  type: NodeType;     // 노드 타입
  nextNodeIds: string[]; // 연결된 다음 노드들의 ID
  offsetX: number;    // 렌더링 시 X축 랜덤 오프셋 (px)
  offsetY: number;    // 렌더링 시 Y축 랜덤 오프셋 (px)
}

interface MapState {
  nodes: MapNode[];
  currentNodeId: string | null;
  currentFloor: number;
  visitedNodeIds: string[];

  // Actions
  generateMap: (chapter?: number) => void;
  moveToNode: (nodeId: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  nodes: [],
  currentNodeId: null,
  currentFloor: 1,
  visitedNodeIds: [],

  generateMap: (chapter: number = 1) => {
    const TOTAL_FLOORS = 15;
    const COLUMNS = 7;
    const NUM_PATHS = 6;
    const mapRng = useRngStore.getState().mapRng;

    // 챕터별 노드 타입 확률 조정
    const getRandomType = (floor: number): NodeType => {
      if (floor === 1) return 'BATTLE';
      if (floor === TOTAL_FLOORS) return 'BOSS';
      if (floor === TOTAL_FLOORS - 1) return 'REST';
      if (floor === Math.floor(TOTAL_FLOORS / 2)) return 'ELITE';

      const r = mapRng.next();
      if (chapter >= 3) {
        // 챕터 3: 엘리트 25%, 휴식 7%, 전투 38%, 이벤트 18%, 상인 12%
        if (r < 0.38) return 'BATTLE';
        if (r < 0.56) return 'EVENT';
        if (r < 0.81) return 'ELITE';
        if (r < 0.88) return 'REST';
        return 'SHOP';
      }
      if (chapter >= 2) {
        // 챕터 2: 엘리트 21%, 휴식 9%, 전투 40%, 이벤트 22%, 상인 8%
        if (r < 0.40) return 'BATTLE';
        if (r < 0.62) return 'EVENT';
        if (r < 0.83) return 'ELITE';
        if (r < 0.92) return 'REST';
        return 'SHOP';
      }
      // 챕터 1: 전투 45%, 이벤트 22%, 엘리트 16%, 휴식 12%, 상인 5%
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

    const paths: Array<Array<[number, number]>> = [];
    const usedStartCols = new Set<number>();

    for (let p = 0; p < NUM_PATHS; p++) {
      // 시작 열 선택 (처음 2개 경로는 서로 다른 시작점 보장)
      let startCol: number;
      if (p < 2) {
        do {
          startCol = mapRng.nextInt(COLUMNS);
        } while (p > 0 && usedStartCols.has(startCol));
        usedStartCols.add(startCol);
      } else {
        startCol = mapRng.nextInt(COLUMNS);
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
        const shuffled = mapRng.shuffle(options);
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
      nextNodeIds: [],
      offsetX: 0,
      offsetY: 0
    });

    for (const path of paths) {
      for (const [floor, col] of path) {
        const key = `${floor}-${col}`;
        if (!nodeMap.has(key)) {
          // 1층·보스 직전층은 오프셋 작게, 나머지는 ±10px 범위
          const jitter = (floor === 1 || floor === TOTAL_FLOORS - 1) ? 4 : 10;
          nodeMap.set(key, {
            id: `f${floor}-p${col}`,
            floor,
            positionX: col,
            type: getRandomType(floor),
            nextNodeIds: [],
            offsetX: Math.round((mapRng.next() - 0.5) * 2 * jitter),
            offsetY: Math.round((mapRng.next() - 0.5) * 2 * jitter)
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
