import React, { useState, useEffect } from 'react';
import { useBattleStore } from '../../store/useBattleStore';
import { useRunStore } from '../../store/useRunStore';
import type { Enemy } from '../../types/enemyTypes';
import {
  iconPhysicalDefense, iconSpecialDefense,
  iconIntentPhysical, iconIntentSpecial,
  iconBurn, iconVulnerable, iconWeaken,
} from '../../assets/images/GUI';

// Pixi 월드 좌표 → 화면 좌표 변환
function useScreenLayout() {
  const [dim, setDim] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { w, h } = dim;
  const scale = (w / h > 16 / 9) ? h / 1080 : w / 1920;
  const ox = (w - 1920 * scale) / 2;
  const oy = (h - 1080 * scale) / 2;

  return { scale, ox, oy, isMobile: w < 768 };
}

// 상태이상 뱃지 색상/아이콘 매핑
const STATUS_CONFIG: Record<string, { color: string; border: string; icon?: string; label?: string }> = {
  BURN:       { color: 'rgba(255,100,0,0.85)',  border: '#ff8833', icon: iconBurn },
  POISON:     { color: 'rgba(34,200,68,0.85)',   border: '#44ff66', label: 'P' },
  VULNERABLE: { color: 'rgba(255,100,150,0.85)', border: '#ff88aa', icon: iconVulnerable },
  WEAK:       { color: 'rgba(68,130,255,0.85)',  border: '#6699ff', icon: iconWeaken },
};

// 인라인 아이콘 헬퍼
const Icon: React.FC<{ src: string; size?: number }> = ({ src, size = 24 }) => (
  <img src={src} alt="" style={{
    width: size, height: size, objectFit: 'contain',
    filter: 'drop-shadow(0 0 2px black)',
    verticalAlign: 'middle',
  }} />
);

// 상태이상 뱃지 하나
const StatusBadge: React.FC<{ statusKey: string; value: number; scale: number }> = ({ statusKey, value, scale }) => {
  const cfg = STATUS_CONFIG[statusKey];
  const badgeSize = Math.max(16, 22 * scale);
  const fontSize = Math.max(10, 13 * scale);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2 * scale,
      background: cfg?.color ?? 'rgba(150,150,150,0.85)',
      border: `1.5px solid ${cfg?.border ?? '#aaa'}`,
      borderRadius: 4 * scale,
      padding: `${1 * scale}px ${4 * scale}px`,
    }}>
      {cfg?.icon ? (
        <Icon src={cfg.icon} size={badgeSize} />
      ) : (
        <span style={{ fontSize: badgeSize * 0.7, fontWeight: 'bold', color: '#fff' }}>
          {cfg?.label ?? statusKey.charAt(0)}
        </span>
      )}
      <span style={{
        fontSize, fontWeight: 'bold', color: '#fff',
        textShadow: '1px 1px 2px black',
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  );
};

// 방어력 표시
const DefenseBadge: React.FC<{ shield: number; resist: number; scale: number }> = ({ shield, resist, scale }) => {
  if (shield <= 0 && resist <= 0) return null;
  const iconSize = Math.max(16, 22 * scale);
  const fontSize = Math.max(11, 15 * scale);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 * scale }}>
      {shield > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2 * scale,
          background: 'rgba(0,0,0,0.6)', borderRadius: 4 * scale, padding: `${1 * scale}px ${5 * scale}px`,
          border: '1px solid rgba(100,180,255,0.5)',
        }}>
          <Icon src={iconPhysicalDefense} size={iconSize} />
          <span style={{ fontSize, fontWeight: 'bold', color: '#8cf', textShadow: '1px 1px 2px black' }}>{shield}</span>
        </div>
      )}
      {resist > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2 * scale,
          background: 'rgba(0,0,0,0.6)', borderRadius: 4 * scale, padding: `${1 * scale}px ${5 * scale}px`,
          border: '1px solid rgba(200,100,255,0.5)',
        }}>
          <Icon src={iconSpecialDefense} size={iconSize} />
          <span style={{ fontSize, fontWeight: 'bold', color: '#d8f', textShadow: '1px 1px 2px black' }}>{resist}</span>
        </div>
      )}
    </div>
  );
};

// 적 의도 표시
const IntentDisplay: React.FC<{ enemy: Enemy; scale: number; masked: boolean }> = ({ enemy, scale, masked }) => {
  if (!enemy.currentIntent) return null;

  let display = enemy.currentIntent.description
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2B55}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
    .trim();
  if (masked) display = display.replace(/\d+/g, '?');

  const intentType = enemy.currentIntent.type;
  const damageType = enemy.currentIntent.damageType;

  let intentIcon: string | null = null;
  if (intentType === 'ATTACK') {
    intentIcon = damageType === 'SPECIAL' ? iconIntentSpecial : iconIntentPhysical;
  } else if (intentType === 'BUFF') {
    intentIcon = iconPhysicalDefense;
  }

  const iconSize = Math.max(20, 30 * scale);
  const fontSize = Math.max(11, 14 * scale);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 * scale,
      background: 'rgba(0,0,0,0.65)', borderRadius: 6 * scale,
      padding: `${2 * scale}px ${8 * scale}px`,
      border: '1px solid rgba(80,140,255,0.4)',
    }}>
      {intentIcon && <Icon src={intentIcon} size={iconSize} />}
      <span style={{
        fontSize, fontWeight: 'bold', color: '#8cf',
        textShadow: '1px 1px 2px black',
        whiteSpace: 'nowrap',
      }}>
        {display}
      </span>
    </div>
  );
};

// 적 1마리에 대한 오버레이 전체
const EnemyOverlay: React.FC<{ enemy: Enemy; index: number; scale: number; ox: number; oy: number; masked: boolean }> = ({
  enemy, index, scale, ox, oy, masked,
}) => {
  if (enemy.currentHp <= 0) return null;

  const isBoss = enemy.tier === 'BOSS';
  const cx = 1920 * (0.6 + index * 0.18) * scale + ox;
  const cy = 1080 * 0.65 * scale + oy;

  // Y 오프셋 (Pixi 월드 좌표 기준 → 화면 픽셀로 스케일링)
  const intentY = (isBoss ? -290 : -170) * scale;
  const hpBarY = (isBoss ? 260 : 140) * scale;
  const defenseY = hpBarY + 14 * scale;
  const statusY = defenseY + 28 * scale;

  const activeStatuses = enemy.statuses
    ? Object.entries(enemy.statuses).filter(([, val]) => val > 0)
    : [];

  return (
    <>
      {/* 의도 */}
      <div style={{
        position: 'absolute',
        left: cx, top: cy + intentY,
        transform: 'translate(-50%, -50%)',
      }}>
        <IntentDisplay enemy={enemy} scale={scale} masked={masked} />
      </div>

      {/* 방어력 */}
      {(enemy.shield > 0 || enemy.resist > 0) && (
        <div style={{
          position: 'absolute',
          left: cx, top: cy + defenseY,
          transform: 'translate(-50%, 0)',
        }}>
          <DefenseBadge shield={enemy.shield} resist={enemy.resist} scale={scale} />
        </div>
      )}

      {/* 상태이상 */}
      {activeStatuses.length > 0 && (
        <div style={{
          position: 'absolute',
          left: cx, top: cy + statusY,
          transform: 'translate(-50%, 0)',
          display: 'flex', gap: 3 * scale,
        }}>
          {activeStatuses.map(([key, val]) => (
            <StatusBadge key={key} statusKey={key} value={val} scale={scale} />
          ))}
        </div>
      )}
    </>
  );
};

// 플레이어 오버레이
const PlayerOverlay: React.FC<{
  scale: number; ox: number; oy: number;
}> = ({ scale, ox, oy }) => {
  const { playerStatus, playerDebuffs, powerDefenseAmmo50, powerPhysicalScalingActive, powerPhysicalScalingBonus } = useBattleStore();

  const cx = 1920 * 0.25 * scale + ox;
  const cy = 1080 * 0.65 * scale + oy;

  const defenseY = 190 * scale;
  const statusY = 220 * scale;

  // 버프/디버프 엔트리 수집
  interface Entry { label: string; icon?: string; color?: string }
  const entries: Entry[] = [];

  if (playerStatus.nextPhysicalFree) entries.push({ label: '무료', color: '#ffdd88' });
  if (playerStatus.cannotPlayPhysicalAttack) entries.push({ label: '물리X', color: '#ff8888' });
  if (playerStatus.retainCardCount > 0) entries.push({ label: `유지${playerStatus.retainCardCount}`, color: '#ffdd88' });
  if (playerStatus.reflectPhysical > 0) entries.push({ label: `반사${playerStatus.reflectPhysical}`, color: '#88ccff' });
  if (playerStatus.apOnSpecialDefend > 0) entries.push({ label: `AP+${playerStatus.apOnSpecialDefend}`, color: '#88ff88' });
  if (playerStatus.ammoOnSpecialDefend > 0) entries.push({ label: `탄+${playerStatus.ammoOnSpecialDefend}`, color: '#ccaa44' });
  if (playerStatus.markOfFate) entries.push({ label: '낙인', color: '#ff6666' });
  if (powerDefenseAmmo50) entries.push({ label: '탄약', color: '#ccaa44' });
  if (powerPhysicalScalingActive) entries.push({ label: `+${powerPhysicalScalingBonus}`, color: '#ffaa44' });

  // 디버프
  if (playerDebuffs.VULNERABLE > 0) entries.push({ label: `${playerDebuffs.VULNERABLE}`, icon: iconVulnerable });
  if (playerDebuffs.WEAK > 0) entries.push({ label: `${playerDebuffs.WEAK}`, icon: iconWeaken });
  Object.entries(playerDebuffs).forEach(([key, val]) => {
    if (key === 'VULNERABLE' || key === 'WEAK') return;
    if (val > 0) {
      const cfg = STATUS_CONFIG[key];
      entries.push({ label: `${val}`, icon: cfg?.icon, color: cfg?.border });
    }
  });

  const fontSize = Math.max(10, 13 * scale);
  const badgeIconSize = Math.max(14, 20 * scale);

  return (
    <>
      {/* 방어력 */}
      {(playerStatus.shield > 0 || playerStatus.resist > 0) && (
        <div style={{
          position: 'absolute',
          left: cx, top: cy + defenseY,
          transform: 'translate(-50%, 0)',
        }}>
          <DefenseBadge shield={playerStatus.shield} resist={playerStatus.resist} scale={scale} />
        </div>
      )}

      {/* 버프/디버프 */}
      {entries.length > 0 && (
        <div style={{
          position: 'absolute',
          left: cx, top: cy + statusY,
          transform: 'translate(-50%, 0)',
          display: 'flex', gap: 3 * scale, flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: 200 * scale,
        }}>
          {entries.map((entry, idx) => (
            <div key={idx} style={{
              display: 'inline-flex', alignItems: 'center', gap: 2 * scale,
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${entry.color ?? 'rgba(255,220,130,0.5)'}`,
              borderRadius: 4 * scale,
              padding: `${1 * scale}px ${4 * scale}px`,
            }}>
              {entry.icon && <Icon src={entry.icon} size={badgeIconSize} />}
              <span style={{
                fontSize, fontWeight: 'bold',
                color: entry.color ?? '#ffdd88',
                textShadow: '1px 1px 2px black',
                lineHeight: 1,
              }}>
                {entry.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export const StatusOverlay: React.FC = () => {
  const { enemies } = useBattleStore();
  const { relics } = useRunStore();
  const { scale, ox, oy } = useScreenLayout();

  const masked = relics.includes('red_eye_surveillance_module');

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* 적 오버레이 */}
      {enemies.map((enemy, idx) => (
        <EnemyOverlay
          key={enemy.id}
          enemy={enemy}
          index={idx}
          scale={scale}
          ox={ox}
          oy={oy}
          masked={masked}
        />
      ))}

      {/* 플레이어 오버레이 */}
      <PlayerOverlay scale={scale} ox={ox} oy={oy} />
    </div>
  );
};
