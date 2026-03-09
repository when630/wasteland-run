import React, { useEffect } from 'react';
import Xarrow from 'react-xarrows';
import { useRunStore } from '../store/useRunStore';
import { useMapStore, type NodeType } from '../store/useMapStore';
import mapBg from '../assets/images/map_background.png';
import battleBadge from '../assets/images/battle_badge.png';
import eliteBadge from '../assets/images/elite_badge.png';
import restBadge from '../assets/images/campfire_badge.png';
import shopBadge from '../assets/images/shop_badge.png';
import eventBadge from '../assets/images/event_badge.png';
import bossBadge from '../assets/images/boss_badge.png';

export const MapView: React.FC = () => {
  const { setScene } = useRunStore();
  const { nodes, currentNodeId, visitedNodeIds, generateMap, moveToNode } = useMapStore();

  // 첫 마운트 시 맵이 없으면 생성
  useEffect(() => {
    if (nodes.length === 0) {
      generateMap();
    }
  }, [nodes, generateMap]);

  // 노드 타입별 뱃지 이미지 매핑
  const typeToIcon: Record<NodeType, string> = {
    BATTLE: battleBadge,
    ELITE: eliteBadge,
    REST: restBadge,
    SHOP: shopBadge,
    EVENT: eventBadge,
    BOSS: bossBadge
  };

  const handleNodeClick = async (nodeId: string, type: NodeType) => {
    moveToNode(nodeId);

    setScene(type);

    // 서버 방향 자동 저장
    const { useRunStore: getRunStore } = await import('../store/useRunStore');
    getRunStore.getState().saveRunData();
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '50px', // 중앙 정렬에서 스크롤 가능한 상단 정렬로 변경
      overflowY: 'auto', // 🌟 긴 맵 내용을 볼 수 있도록 수직 스크롤 오버플로우 활성화
      overflowX: 'hidden'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#88aabb', flexShrink: 0 }}>
        황무지 지도
      </h1>
      <p style={{ fontSize: '20px', color: '#ccc', marginBottom: '40px', flexShrink: 0 }}>
        여정을 이어갈 다음 노드를 선택하세요.
      </p>

      {/* 맵 노드 트리 렌더링 영역 */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column-reverse', gap: '60px', alignItems: 'center',
        padding: '40px', border: '1px solid #333', borderRadius: '12px',
        backgroundImage: `url(${mapBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(26, 26, 26, 0.8)', // 기본 #1a1a1a 컬러의 투명 버전 형태
        minWidth: '600px',
        marginBottom: '100px'
      }}>
        {/* 층(Floor) 단위로 렌더링 — 7열 그리드, 경로가 없는 자리는 빈 스페이서 */}
        {Array.from({ length: 15 }, (_, i) => i + 1).map(floorNum => {
          const floorNodes = nodes.filter(n => n.floor === floorNum);
          if (floorNodes.length === 0) return null;

          return (
            <div key={`floor-${floorNum}`} style={{ display: 'flex', gap: '24px', justifyContent: 'center', width: '100%' }}>
              {[0, 1, 2, 3, 4, 5, 6].map(pos => {
                const node = floorNodes.find(n => n.positionX === pos);

                if (!node) {
                  return <div key={`empty-${floorNum}-${pos}`} style={{ width: '50px', height: '50px', flexShrink: 0 }} />;
                }

                const isCurrent = node.id === currentNodeId;
                const isVisited = visitedNodeIds.includes(node.id);
                const isNextAvailable = !currentNodeId
                  ? node.floor === 1
                  : nodes.find(n => n.id === currentNodeId)?.nextNodeIds.includes(node.id);

                return (
                  <div
                    key={node.id}
                    id={node.id}
                    onClick={() => {
                      if (isNextAvailable) handleNodeClick(node.id, node.type);
                    }}
                    style={{
                      width: '50px', height: '50px', borderRadius: '50%',
                      backgroundColor: isCurrent ? '#00bbff' : (isVisited ? '#006688' : (isNextAvailable ? '#444' : '#222')),
                      border: isCurrent ? '3px solid #fff' : (isVisited ? '2px solid #00bbff' : (isNextAvailable ? '2px solid #888' : '2px dashed #333')),
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      fontSize: '20px', cursor: isNextAvailable ? 'pointer' : 'not-allowed',
                      boxShadow: isCurrent ? '0 0 15px #00bbff' : (isVisited ? '0 0 10px #006688' : 'none'),
                      opacity: isVisited && !isCurrent ? 0.8 : 1,
                      transition: 'all 0.3s',
                      position: 'relative',
                      flexShrink: 0,
                      zIndex: 3
                    }}
                    title={`${node.floor}층 - ${node.type}`}
                  >
                    <img src={typeToIcon[node.type]} alt={node.type} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* 맵 트리 엣지(Line) 렌더링 영역 */}
        {nodes.map(node => (
          node.nextNodeIds.map(nextId => {
            const isPastPath = visitedNodeIds.includes(node.id) && visitedNodeIds.includes(nextId);

            // 현재 활성화된 노드에서 출발하는 선발 길들
            const isAvailablePath = (node.id === currentNodeId) && nodes.find(n => n.id === currentNodeId)?.nextNodeIds.includes(nextId);

            let lineColor = '#333';
            let strokeWidth = 2;
            let edgeZIndex = 1;

            if (isPastPath) {
              lineColor = '#00bbff'; // 이미 지나온 경로
              strokeWidth = 4;
              edgeZIndex = 2;
            } else if (isAvailablePath) {
              lineColor = '#aaa'; // 다음 개방된 경로
              strokeWidth = 3;
              edgeZIndex = 2;
            }

            return (
              <Xarrow
                key={`${node.id}-${nextId}`}
                start={node.id}
                end={nextId}
                startAnchor="top"
                endAnchor="bottom"
                color={lineColor}
                strokeWidth={strokeWidth}
                path="straight"
                showHead={false}
                zIndex={edgeZIndex}
              />
            );
          })
        ))}
      </div>
    </div>
  );
};
