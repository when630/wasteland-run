import { create } from 'zustand';

export type NodeType = 'BATTLE' | 'ELITE' | 'REST' | 'SHOP' | 'EVENT' | 'BOSS';

export interface MapNode {
  id: string;         // 고유 식별자 (예: 'f1-p0')
  floor: number;      // 맵의 깊이 (y축 역할)
  positionX: number;  // 층 내 위치 (0, 1, 2) (x축 렌더링 역할)
  type: NodeType;     // 노드 타입
  nextNodeIds: string[]; // 연결된 다음 노드들의 ID 가리킴
}

interface MapState {
  nodes: MapNode[];
  currentNodeId: string | null;
  currentFloor: number;
  visitedNodeIds: string[]; // 🌟 플레이어가 거쳐온 노드의 히스토리 배열

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
    const PATHS_PER_FLOOR = 3;
    const newNodes: MapNode[] = [];

    // 노드 타입 굴리기 유틸 함수
    const getRandomType = (floor: number): NodeType => {
      if (floor === 1) return 'BATTLE'; // 1층은 무조건 배틀
      if (floor === TOTAL_FLOORS) return 'BOSS'; // 꼭대기는 보스
      if (floor === TOTAL_FLOORS - 1) return 'REST'; // 보스 직전은 무조건 휴식처
      if (floor === Math.floor(TOTAL_FLOORS / 2)) return 'ELITE'; // 중간층 엘리트 강제 배치

      // 기본적인 맵 등장 확률 가중치
      const random = Math.random();
      if (random < 0.45) return 'BATTLE'; // 45%
      if (random < 0.70) return 'EVENT';  // 25%
      if (random < 0.85) return 'SHOP';   // 15%
      if (random < 0.95) return 'REST';   // 10%
      return 'ELITE';                     // 5% (가끔 등장하는 추가 엘리트)
    };

    // 1. 노드 껍데기 생성 (위치와 타입 부여)
    for (let floor = 1; floor <= TOTAL_FLOORS; floor++) {
      if (floor === TOTAL_FLOORS) {
        // 보스방은 1개만 생성 (중앙 배치)
        newNodes.push({
          id: `f${floor}-boss`,
          floor,
          positionX: 1, // 0, 1, 2 중 중앙인 1
          type: 'BOSS',
          nextNodeIds: [] // 클리어 시 맵 이동 끝
        });
      } else if (floor === 1) {
        // 시작 지점은 1개만 생성 (중앙 배치)
        newNodes.push({
          id: `f${floor}-start`,
          floor,
          positionX: 1,
          type: 'BATTLE',
          nextNodeIds: []
        });
      } else {
        // 일반 층은 PATHS_PER_FLOOR(3) 개 만큼 생성
        for (let pos = 0; pos < PATHS_PER_FLOOR; pos++) {
          newNodes.push({
            id: `f${floor}-p${pos}`,
            floor,
            positionX: pos,
            type: getRandomType(floor),
            nextNodeIds: []
          });
        }
      }
    }

    // 2. 층간 연결(Edges) 알고리즘 구성
    // 각 층의 노드는 다음 층(floor+1)의 자신과 같거나 좌우 인접한(±1) 노드 중 1~2개와 연결됨.
    for (let floor = 1; floor < TOTAL_FLOORS; floor++) {
      const currentFloorNodes = newNodes.filter(n => n.floor === floor);
      const nextFloorNodes = newNodes.filter(n => n.floor === floor + 1);

      currentFloorNodes.forEach((node) => {
        // 보스방(15층)을 향하는 14층 노드들은 모두 무조건 보스방 1개에 연결됨
        if (floor === TOTAL_FLOORS - 1) {
          node.nextNodeIds.push(nextFloorNodes[0].id);
          return;
        }

        // 시작 지점(1층)은 2층의 모든 경로(3개)로 자유롭게 진입 가능하도록 전체 개방
        if (floor === 1) {
          node.nextNodeIds = nextFloorNodes.map(n => n.id);
          return;
        }

        // 일반적인 연결 (바로 위 및 양 옆 대각선)
        const possibleNextIds: string[] = [];
        const x = node.positionX;

        // 무조건 자신의 직진(위) 경로는 높은 확률로 뚫림
        if (nextFloorNodes[x]) possibleNextIds.push(nextFloorNodes[x].id);

        // 엇갈리는 대각선 경로 (30% 확률로 뚫림)
        if (x - 1 >= 0 && Math.random() < 0.3) possibleNextIds.push(nextFloorNodes[x - 1].id);
        if (x + 1 < PATHS_PER_FLOOR && Math.random() < 0.3) possibleNextIds.push(nextFloorNodes[x + 1].id);

        // 아무 길도 없는 고립을 막기 위해 최소 1개는 강제 확보 (방금 만든 possibleNextIds가 비었을 경우 대비)
        if (possibleNextIds.length === 0) {
          possibleNextIds.push(nextFloorNodes[x].id);
        }

        // 중복 제거 후 추가
        node.nextNodeIds = Array.from(new Set(possibleNextIds));
      });

      // (선택 보정 로직) 다음 층의 어떤 노드도 이전 층에서 도달할 수 없는 '도달 불가' 노드가 발생했는지 검사
      // 도달 불가 노드가 있다면, 이전 층의 가까운 노드에서 강제로 선을 하나 이어준다.
      if (floor < TOTAL_FLOORS - 1) { // 보스방 제외
        nextFloorNodes.forEach(targetNode => {
          const hasIncoming = currentFloorNodes.some(n => n.nextNodeIds.includes(targetNode.id));
          if (!hasIncoming) {
            // 들어오는 선이 없으면 가장 x좌표가 가까운 현재 층 노드에 강제로 파이프 연결
            const closestNode = currentFloorNodes.reduce((prev, curr) =>
              Math.abs(curr.positionX - targetNode.positionX) < Math.abs(prev.positionX - targetNode.positionX) ? curr : prev
            );
            closestNode.nextNodeIds.push(targetNode.id);
            closestNode.nextNodeIds = Array.from(new Set(closestNode.nextNodeIds)); // 고유화
          }
        });
      }
    }

    set({
      nodes: newNodes,
      currentNodeId: null, // 초기화 시 입장 전 대기상태를 null로 설정
      currentFloor: 1,
      visitedNodeIds: [] // 맵이 새로 띄워지면 방문 궤적 초기화
    });
  },

  moveToNode: (nodeId: string) => set((state) => {
    const targetNode = state.nodes.find(n => n.id === nodeId);
    if (!targetNode) return state;

    return {
      currentNodeId: nodeId,
      currentFloor: targetNode.floor,
      visitedNodeIds: [...state.visitedNodeIds, nodeId] // 현재 밟은 노드를 기록함
    };
  })
}));
