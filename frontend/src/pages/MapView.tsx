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

interface MapViewProps {
  viewOnly?: boolean;
  onClose?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ viewOnly = false, onClose }) => {
  const { setScene } = useRunStore();
  const { nodes, currentNodeId, visitedNodeIds, generateMap, setPendingNode, commitPendingNode } = useMapStore();

  // 첫 마운트 시 맵이 없으면 생성 (현재 챕터 기반)
  const { currentChapter } = useRunStore();
  useEffect(() => {
    if (nodes.length === 0) {
      generateMap(currentChapter);
    }
  }, [nodes, generateMap, currentChapter]);

  // 씬 완료 후 MAP 복귀 시 pending 노드를 커밋하고 저장
  useEffect(() => {
    if (!viewOnly && useMapStore.getState().pendingNodeId) {
      commitPendingNode();
      useRunStore.getState().saveRunData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 노드 타입별 뱃지 이미지 매핑
  const typeToIcon: Record<NodeType, string> = {
    BATTLE: battleBadge,
    ELITE: eliteBadge,
    REST: restBadge,
    SHOP: shopBadge,
    EVENT: eventBadge,
    BOSS: bossBadge
  };

  const handleNodeClick = (nodeId: string, type: NodeType) => {
    setPendingNode(nodeId);
    setScene(type);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${mapBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '50px',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {viewOnly && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'fixed', top: '16px', right: '20px',
            background: 'rgba(62, 42, 20, 0.7)', border: '2px solid #8b6f47', borderRadius: '50%',
            color: '#e8d5b0', fontSize: '28px', width: '44px', height: '44px',
            cursor: 'pointer', transition: 'all 0.2s', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, padding: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(62, 42, 20, 0.9)'; e.currentTarget.style.borderColor = '#c4a96a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(62, 42, 20, 0.7)'; e.currentTarget.style.borderColor = '#8b6f47'; }}
        >
          ×
        </button>
      )}
      <h1 style={{
        fontSize: '48px', marginBottom: '20px', flexShrink: 0,
        color: '#3e2a14',
        textShadow: '1px 1px 0 #c4a96a',
        fontFamily: 'serif'
      }}>
        황무지 지도
      </h1>
      <p style={{ fontSize: '20px', color: '#5a3e28', marginBottom: '40px', flexShrink: 0, fontFamily: 'serif', textShadow: '0 1px 0 rgba(196, 169, 106, 0.5)' }}>
        {viewOnly ? '현재 진행 상황을 확인하세요.' : '여정을 이어갈 다음 노드를 선택하세요.'}
      </p>

      {/* 맵 노드 트리 렌더링 영역 — 양피지 느낌 */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column-reverse', gap: '60px', alignItems: 'center',
        padding: '50px 40px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #d4b896 0%, #e8d5b0 25%, #d9c4a0 50%, #e0cba5 75%, #c8a882 100%)',
        border: '3px solid #8b6f47',
        boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 0 60px rgba(139, 111, 71, 0.3)',
        minWidth: '600px',
        marginBottom: '100px'
      }}>
        {/* 양피지 질감 오버레이 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          borderRadius: '8px',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139, 111, 71, 0.03) 3px, rgba(139, 111, 71, 0.03) 4px)',
          pointerEvents: 'none', zIndex: 0
        }} />

        {/* 층(Floor) 단위로 렌더링 — 7열 그리드 */}
        {Array.from({ length: 15 }, (_, i) => i + 1).map(floorNum => {
          const floorNodes = nodes.filter(n => n.floor === floorNum);
          if (floorNodes.length === 0) return null;

          return (
            <div key={`floor-${floorNum}`} style={{ display: 'flex', gap: '24px', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
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
                      if (!viewOnly && isNextAvailable) handleNodeClick(node.id, node.type);
                    }}
                    style={{
                      width: '50px', height: '50px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      cursor: viewOnly ? 'default' : (isNextAvailable ? 'pointer' : 'default'),
                      opacity: (isCurrent || isVisited || isNextAvailable) ? 1 : 0.35,
                      transition: 'all 0.3s',
                      position: 'relative',
                      flexShrink: 0,
                      zIndex: 3,
                      transform: `translate(${node.offsetX}px, ${node.offsetY}px)`,
                      filter: isCurrent
                        ? 'drop-shadow(0 0 8px #3e2a14) drop-shadow(0 0 16px rgba(196, 169, 106, 0.8))'
                        : isVisited
                          ? 'drop-shadow(0 0 6px rgba(90, 62, 40, 0.5))'
                          : isNextAvailable
                            ? 'drop-shadow(0 0 6px rgba(139, 111, 71, 0.6))'
                            : 'none'
                    }}
                    title={`${node.floor}층 - ${node.type}`}
                  >
                    <img
                      src={typeToIcon[node.type]}
                      alt={node.type}
                      style={{
                        width: isCurrent ? '110%' : '100%',
                        height: isCurrent ? '110%' : '100%',
                        objectFit: 'contain',
                        transition: 'all 0.3s'
                      }}
                    />
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

            let lineColor = 'rgba(139, 111, 71, 0.3)';
            let strokeWidth = 2;
            let edgeZIndex = 1;

            if (isPastPath) {
              lineColor = '#5a3e28';
              strokeWidth = 4;
              edgeZIndex = 2;
            } else if (isAvailablePath) {
              lineColor = '#8b6f47';
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
