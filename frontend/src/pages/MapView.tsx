import React, { useEffect } from 'react';
import Xarrow from 'react-xarrows';
import { useRunStore } from '../store/useRunStore';
import { useMapStore, type NodeType } from '../store/useMapStore';
import mapBg1 from '../assets/images/backgrounds/map_background_zone1.webp';
import mapBg2 from '../assets/images/backgrounds/map_background_zone2.webp';
import mapBg3 from '../assets/images/backgrounds/map_background_zone3.webp';

const MAP_BGS: Record<number, string> = { 1: mapBg1, 2: mapBg2, 3: mapBg3 };
const ZONE_NAMES: Record<number, string> = {
  1: '오염된 외곽 도시',
  2: '무너진 지하철도',
  3: '거대 기업의 방주',
};
import battleBadge from '../assets/images/map/battle_badge.webp';
import eliteBadge from '../assets/images/map/elite_badge.webp';
import restBadge from '../assets/images/map/campfire_badge.webp';
import shopBadge from '../assets/images/map/shop_badge.webp';
import eventBadge from '../assets/images/map/event_badge.webp';
import bossBadge from '../assets/images/map/boss_badge.webp';
import { iconClose, iconLoot } from '../assets/images/GUI';

interface MapViewProps {
  viewOnly?: boolean;
  onClose?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ viewOnly = false, onClose }) => {
  const { setScene } = useRunStore();
  const { nodes, currentNodeId, visitedNodeIds, generateMap, setPendingNode, commitPendingNode, mapChapter } = useMapStore();

  // 맵이 없거나 챕터가 변경되었으면 새로 생성
  const { currentChapter } = useRunStore();
  useEffect(() => {
    if (nodes.length === 0 || mapChapter !== currentChapter) {
      generateMap(currentChapter);
    }
  }, [nodes.length, mapChapter, generateMap, currentChapter]);

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
    BOSS: bossBadge,
    TREASURE: iconLoot,
  };

  const handleNodeClick = (nodeId: string, type: NodeType) => {
    setPendingNode(nodeId);
    setScene(type);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#2a2a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '50px',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {viewOnly && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'fixed', top: '16px', right: '20px',
            background: 'none', border: 'none',
            cursor: 'pointer', transition: 'all 0.2s', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <img src={iconClose} alt="닫기" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </button>
      )}
      {/* 맵 노드 트리 렌더링 영역 — 양피지 느낌 */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column-reverse', gap: '70px', alignItems: 'center',
        padding: '60px 60px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #d4b896 0%, #e8d5b0 25%, #d9c4a0 50%, #e0cba5 75%, #c8a882 100%)',
        border: '3px solid #8b6f47',
        boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 0 60px rgba(139, 111, 71, 0.3)',
        minWidth: '850px',
        marginBottom: '100px',
      }}>
        {/* Zone 배경 이미지 오버레이 (아주 연하게) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          borderRadius: '8px',
          backgroundImage: `url(${MAP_BGS[currentChapter] || mapBg1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.12,
          pointerEvents: 'none', zIndex: 0
        }} />
        {/* 양피지 질감 오버레이 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          borderRadius: '8px',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139, 111, 71, 0.03) 3px, rgba(139, 111, 71, 0.03) 4px)',
          pointerEvents: 'none', zIndex: 0
        }} />

        {/* 지도 제목 — 맵 패널 최상단 */}
        <div style={{
          width: '100%', textAlign: 'center', position: 'relative', zIndex: 4,
          borderBottom: '1px solid rgba(139, 111, 71, 0.3)',
          paddingBottom: '20px',
          marginBottom: '-30px',
        }}>
          <div style={{
            fontSize: '32px',
            fontFamily: 'serif', fontWeight: 700,
            color: '#3e2a14',
            textShadow: '1px 1px 0 rgba(196, 169, 106, 0.5)',
            letterSpacing: '0.08em',
          }}>
            {ZONE_NAMES[currentChapter] || ZONE_NAMES[1]}
          </div>
          <div style={{
            fontSize: '14px',
            fontFamily: 'serif',
            color: '#8b6f47',
            marginTop: '4px',
          }}>
            Chapter {currentChapter}
          </div>
        </div>

        {/* 층(Floor) 단위로 렌더링 — 7열 그리드 */}
        {Array.from({ length: 15 }, (_, i) => i + 1).map(floorNum => {
          const floorNodes = nodes.filter(n => n.floor === floorNum);
          if (floorNodes.length === 0) return null;

          return (
            <div key={`floor-${floorNum}`} style={{ display: 'flex', justifyContent: 'center', gap: '60px', width: '100%', position: 'relative', zIndex: 1 }}>
              {[0, 1, 2, 3, 4, 5, 6].map(pos => {
                const node = floorNodes.find(n => n.positionX === pos);
                const cellSize = '40px';

                if (!node) {
                  return <div key={`empty-${floorNum}-${pos}`} style={{ width: cellSize, maxWidth: '40px', height: '40px', flexShrink: 0 }} />;
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
                      width: cellSize, maxWidth: '40px', height: '40px',
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

        {/* 맵 트리 엣지(Line) 렌더링 — 삐뚤빼뚤 점선 */}
        {nodes.map(node => (
          node.nextNodeIds.map(nextId => {
            const isPastPath = visitedNodeIds.includes(node.id) && visitedNodeIds.includes(nextId);
            const isAvailablePath = (node.id === currentNodeId) && nodes.find(n => n.id === currentNodeId)?.nextNodeIds.includes(nextId);

            let lineColor = 'rgba(90, 62, 40, 0.5)';
            let strokeWidth = 1.5;
            let edgeZIndex = 1;
            let dashStr = '6 5';

            if (isPastPath) {
              lineColor = '#3e2a14';
              strokeWidth = 2.5;
              edgeZIndex = 2;
              dashStr = '8 4';
            } else if (isAvailablePath) {
              lineColor = '#5a3e28';
              strokeWidth = 2;
              edgeZIndex = 2;
              dashStr = '7 4';
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
                path="smooth"
                curveness={0.6}
                showHead={false}
                zIndex={edgeZIndex}
                dashness={{ strokeLen: parseInt(dashStr), nonStrokeLen: parseInt(dashStr.split(' ')[1]) }}
                SVGcanvasStyle={{ filter: 'url(#wobbly)', pointerEvents: 'none' }}
              />
            );
          })
        ))}
        {/* 삐뚤빼뚤 효과용 SVG 필터 */}
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
          <defs>
            <filter id="wobbly">
              <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" result="turbulence" seed="2" />
              <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
};
