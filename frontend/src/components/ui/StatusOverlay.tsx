import React, { useState, useEffect, useCallback } from 'react';
import { useBattleStore } from '../../store/useBattleStore';
import { useRunStore } from '../../store/useRunStore';
import type { Enemy } from '../../types/enemyTypes';
import { DESIGN_WIDTH, DESIGN_HEIGHT, BATTLE_Y_RATIO, enemyPos } from '../pixi/vfx/battleLayout';
import {
  iconPhysicalDefense, iconSpecialDefense,
  iconIntentPhysical, iconIntentSpecial,
  iconBurn, iconVulnerable, iconWeaken, iconPoison,
  iconBuffFreePhysical, iconBuffNoPhysical, iconBuffRetain, iconBuffReflect,
  iconBuffApOnDefend, iconBuffAmmoOnDefend, iconBuffMarkOfFate, iconBuffDefenseAmmo, iconBuffPhysicalScaling,
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
  const scale = (w / h > 16 / 9) ? h / DESIGN_HEIGHT : w / DESIGN_WIDTH;
  const ox = (w - DESIGN_WIDTH * scale) / 2;
  const oy = (h - DESIGN_HEIGHT * scale) / 2;

  return { scale, ox, oy };
}

// 상태이상 뱃지 색상/아이콘 매핑
const STATUS_CONFIG: Record<string, { color: string; border: string; icon?: string; label?: string; desc: string }> = {
  BURN:       { color: 'rgba(255,100,0,0.85)',  border: '#ff8833', icon: iconBurn, desc: '화상: 턴 시작 시 스택만큼 피해, 이후 1 감소' },
  POISON:     { color: 'rgba(34,200,68,0.85)',   border: '#44ff66', icon: iconPoison, desc: '맹독: 턴 시작 시 스택만큼 방어 무시 피해, 이후 1 감소' },
  VULNERABLE: { color: 'rgba(255,100,150,0.85)', border: '#ff88aa', icon: iconVulnerable, desc: '취약: 받는 피해 50% 증가 (남은 턴)' },
  WEAK:       { color: 'rgba(68,130,255,0.85)',  border: '#6699ff', icon: iconWeaken, desc: '약화: 가하는 물리 피해 25% 감소 (남은 턴)' },
};

// 플레이어 버프/디버프 설명 매핑
const PLAYER_BUFF_DESC: Record<string, string> = {
  '무료': '다음 물리 공격 카드의 AP 비용이 0이 됩니다.',
  '물리X': '이번 턴 동안 물리 공격 카드를 사용할 수 없습니다.',
  '유지': '턴 종료 시 손패의 일부를 다음 턴으로 보존합니다.',
  '반사': '물리 피격 시 공격자에게 표시된 수치만큼 피해를 반사합니다.',
  'AP+': '특수 방어 사용 시 다음 턴 추가 AP를 얻습니다.',
  '탄+': '특수 방어 사용 시 탄약을 획득합니다.',
  '낙인': '운명의 낙인: 치명적 피해 시 한 번 부활합니다.',
  '탄약': '방어 카드 사용 시 50% 확률로 탄약 1 획득.',
  '스케일': '처치할 때마다 물리 피해가 누적 증가합니다.',
};

// 인라인 아이콘 헬퍼
const Icon: React.FC<{ src: string; size?: number }> = ({ src, size = 24 }) => (
  <img src={src} alt="" style={{
    width: size, height: size, objectFit: 'contain',
    filter: 'drop-shadow(0 0 2px black)',
    verticalAlign: 'middle',
  }} />
);

// 아이콘 + 우상단 숫자 + 클릭 툴팁 공용 뱃지
const IconBadge: React.FC<{
  icon?: string; label?: string; value: string | number;
  color: string; desc: string; scale: number;
}> = ({ icon, label, value, color, desc, scale }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(prev => !prev);
  }, []);

  useEffect(() => {
    if (!showTooltip) return;
    const close = () => setShowTooltip(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [showTooltip]);

  const iconSize = Math.max(24, 36 * scale);
  const fontSize = Math.max(11, 14 * scale);
  const tooltipFontSize = Math.max(10, 12 * scale);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onPointerDown={handleClick}
    >
      {icon ? (
        <Icon src={icon} size={iconSize} />
      ) : (
        <span style={{
          width: iconSize, height: iconSize,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: iconSize * 0.5, fontWeight: 'bold', color: '#fff',
          background: color, borderRadius: 6 * scale,
          textShadow: '1px 1px 2px black',
        }}>
          {label}
        </span>
      )}
      <span style={{
        position: 'absolute',
        top: -4 * scale,
        right: -4 * scale,
        fontSize, fontWeight: 'bold', color: '#fff',
        textShadow: '1px 1px 3px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8)',
        lineHeight: 1,
        pointerEvents: 'none',
      }}>
        {value}
      </span>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10,10,20,0.92)',
          border: `1px solid ${color}`,
          borderRadius: 6 * scale,
          padding: `${4 * scale}px ${8 * scale}px`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          <div style={{ fontSize: tooltipFontSize, color: '#ddd' }}>
            {desc}
          </div>
        </div>
      )}
    </div>
  );
};

// 적 상태이상 뱃지
const StatusBadge: React.FC<{ statusKey: string; value: number; scale: number }> = ({ statusKey, value, scale }) => {
  const cfg = STATUS_CONFIG[statusKey];
  return (
    <IconBadge
      icon={cfg?.icon}
      label={cfg?.label ?? statusKey.charAt(0)}
      value={value}
      color={cfg?.border ?? '#aaa'}
      desc={cfg?.desc ?? statusKey}
      scale={scale}
    />
  );
};

// 방어력 표시
const DefenseBadge: React.FC<{ shield: number; resist: number; scale: number }> = ({ shield, resist, scale }) => {
  if (shield <= 0 && resist <= 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 * scale }}>
      {shield > 0 && (
        <IconBadge
          icon={iconPhysicalDefense}
          value={shield}
          color="#4488cc"
          desc="물리 방어도: 물리 공격 피해를 흡수합니다. 턴 종료 시 초기화."
          scale={scale}
        />
      )}
      {resist > 0 && (
        <IconBadge
          icon={iconSpecialDefense}
          value={resist}
          color="#aa66ff"
          desc="특수 방어도: 특수 공격 피해를 흡수합니다. 턴 종료 시 초기화."
          scale={scale}
        />
      )}
    </div>
  );
};

// 적 의도 표시
const IntentDisplay: React.FC<{ enemy: Enemy; scale: number; masked: boolean }> = ({ enemy, scale, masked }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(prev => !prev);
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!showTooltip) return;
    const close = () => setShowTooltip(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [showTooltip]);

  if (!enemy.currentIntent) return null;

  const intentType = enemy.currentIntent.type;
  const damageType = enemy.currentIntent.damageType;
  const amount = enemy.currentIntent.amount;
  const description = enemy.currentIntent.description
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2B55}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
    .trim();

  let intentIcon: string | null = null;
  if (intentType === 'ATTACK') {
    intentIcon = damageType === 'SPECIAL' ? iconIntentSpecial : iconIntentPhysical;
  } else if (intentType === 'BUFF') {
    intentIcon = iconPhysicalDefense;
  }

  // 숫자 표시: 유물 마스킹 시 '?', 아니면 amount
  const amountText = amount != null ? (masked ? '?' : `${amount}`) : null;

  // 툴팁 텍스트 조합
  const typeLabel = intentType === 'ATTACK'
    ? (damageType === 'SPECIAL' ? '특수 공격' : '물리 공격')
    : intentType === 'BUFF' ? '방어/버프' : '행동';
  const tooltipLine1 = typeLabel;
  const tooltipLine2 = masked ? description.replace(/\d+/g, '?') : description;

  const iconSize = Math.max(32, 48 * scale);
  const fontSize = Math.max(14, 18 * scale);
  const tooltipFontSize = Math.max(10, 12 * scale);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onPointerDown={handleClick}
    >
      {intentIcon && <Icon src={intentIcon} size={iconSize} />}
      {amountText && (
        <span style={{
          position: 'absolute',
          top: -6 * scale,
          right: -6 * scale,
          fontSize, fontWeight: 'bold', color: '#fff',
          textShadow: '1px 1px 3px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          pointerEvents: 'none',
        }}>
          {amountText}
        </span>
      )}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10,10,20,0.92)',
          border: '1px solid rgba(120,170,255,0.5)',
          borderRadius: 6 * scale,
          padding: `${4 * scale}px ${8 * scale}px`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          <div style={{
            fontSize: tooltipFontSize, fontWeight: 'bold',
            color: intentType === 'ATTACK' ? (damageType === 'SPECIAL' ? '#c8aaff' : '#ffaa88') : '#88ccff',
            marginBottom: 2 * scale,
          }}>
            {tooltipLine1}
          </div>
          <div style={{
            fontSize: tooltipFontSize, color: '#ccc',
          }}>
            {tooltipLine2}
          </div>
          {enemy.nextIntent && (
            <div style={{
              marginTop: 4 * scale,
              paddingTop: 3 * scale,
              borderTop: '1px solid rgba(180, 140, 255, 0.3)',
            }}>
              <div style={{
                fontSize: tooltipFontSize * 0.9, fontWeight: 'bold',
                color: '#b088ff',
                marginBottom: 1 * scale,
              }}>
                {'🔮 다음 턴'}
              </div>
              <div style={{
                fontSize: tooltipFontSize * 0.9, color: '#aaa',
              }}>
                {masked
                  ? enemy.nextIntent.description.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2B55}\u{FE00}-\u{FE0F}\u{200D}]/gu, '').trim().replace(/\d+/g, '?')
                  : enemy.nextIntent.description.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2B55}\u{FE00}-\u{FE0F}\u{200D}]/gu, '').trim()
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 적 1마리에 대한 오버레이 전체
const EnemyOverlay: React.FC<{ enemy: Enemy; index: number; total: number; scale: number; ox: number; oy: number; masked: boolean }> = ({
  enemy, index, total, scale, ox, oy, masked,
}) => {
  if (enemy.currentHp <= 0) return null;

  const isBoss = enemy.tier === 'BOSS';
  const ePos = enemyPos(index, total);
  const cx = ePos.x * scale + ox;
  const cy = ePos.y * scale + oy;

  // Y 오프셋 (Pixi 월드 좌표 기준 → 화면 픽셀로 스케일링, 1280x720 기준)
  const intentY = (isBoss ? -193 : -113) * scale;
  const hpBarY = (isBoss ? 173 : 93) * scale;
  const hpBarRight = (isBoss ? 80 : 53) * scale; // HP바 우측 끝 (width/2)
  const statusY = hpBarY + (isBoss ? 16 : 15) * scale; // HP바 바로 아래

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

      {/* 방어력 — HP바 오른쪽 옆 */}
      {(enemy.shield > 0 || enemy.resist > 0) && (
        <div style={{
          position: 'absolute',
          left: cx + hpBarRight + 8 * scale,
          top: cy + hpBarY,
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
        }}>
          <DefenseBadge shield={enemy.shield} resist={enemy.resist} scale={scale} />
        </div>
      )}

      {/* 상태이상 — HP바 바로 아래 */}
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
  const playerStatus = useBattleStore(s => s.playerStatus);
  const playerDebuffs = useBattleStore(s => s.playerDebuffs);
  const powerDefenseAmmo50 = useBattleStore(s => s.powerDefenseAmmo50);
  const powerPhysicalScalingActive = useBattleStore(s => s.powerPhysicalScalingActive);
  const powerPhysicalScalingBonus = useBattleStore(s => s.powerPhysicalScalingBonus);

  const cx = DESIGN_WIDTH * 0.25 * scale + ox;
  const cy = DESIGN_HEIGHT * BATTLE_Y_RATIO * scale + oy;

  const hpBarY = 103 * scale;       // HP바 Y (BattleStage와 동기)
  const hpBarRight = 53 * scale;    // HP바 우측 끝 (width 107의 절반)
  const statusY = (103 + 19) * scale; // HP바 아래 + 여백

  // 버프/디버프 엔트리 수집
  interface Entry { value: string | number; icon?: string; label?: string; color: string; desc: string }
  const entries: Entry[] = [];

  if (playerStatus.nextPhysicalFree) entries.push({ icon: iconBuffFreePhysical, value: '', color: '#ffdd88', desc: PLAYER_BUFF_DESC['무료'] });
  if (playerStatus.cannotPlayPhysicalAttack) entries.push({ icon: iconBuffNoPhysical, value: '', color: '#ff8888', desc: PLAYER_BUFF_DESC['물리X'] });
  if (playerStatus.retainCardCount > 0) entries.push({ icon: iconBuffRetain, value: playerStatus.retainCardCount, color: '#ffdd88', desc: PLAYER_BUFF_DESC['유지'] });
  if (playerStatus.reflectPhysical > 0) entries.push({ icon: iconBuffReflect, value: playerStatus.reflectPhysical, color: '#88ccff', desc: PLAYER_BUFF_DESC['반사'] });
  if (playerStatus.apOnSpecialDefend > 0) entries.push({ icon: iconBuffApOnDefend, value: playerStatus.apOnSpecialDefend, color: '#88ff88', desc: PLAYER_BUFF_DESC['AP+'] });
  if (playerStatus.ammoOnSpecialDefend > 0) entries.push({ icon: iconBuffAmmoOnDefend, value: playerStatus.ammoOnSpecialDefend, color: '#ccaa44', desc: PLAYER_BUFF_DESC['탄+'] });
  if (playerStatus.markOfFate) entries.push({ icon: iconBuffMarkOfFate, value: '', color: '#ff6666', desc: PLAYER_BUFF_DESC['낙인'] });
  if (powerDefenseAmmo50) entries.push({ icon: iconBuffDefenseAmmo, value: '', color: '#ccaa44', desc: PLAYER_BUFF_DESC['탄약'] });
  if (powerPhysicalScalingActive) entries.push({ icon: iconBuffPhysicalScaling, value: `+${powerPhysicalScalingBonus}`, color: '#ffaa44', desc: PLAYER_BUFF_DESC['스케일'] });

  // 디버프 (아이콘 있는 것)
  if (playerDebuffs.VULNERABLE > 0) entries.push({ icon: iconVulnerable, value: playerDebuffs.VULNERABLE, color: '#ff88aa', desc: STATUS_CONFIG.VULNERABLE.desc });
  if (playerDebuffs.WEAK > 0) entries.push({ icon: iconWeaken, value: playerDebuffs.WEAK, color: '#6699ff', desc: STATUS_CONFIG.WEAK.desc });
  Object.entries(playerDebuffs).forEach(([key, val]) => {
    if (key === 'VULNERABLE' || key === 'WEAK') return;
    if (val > 0) {
      const cfg = STATUS_CONFIG[key];
      entries.push({ icon: cfg?.icon, label: cfg?.label ?? key.charAt(0), value: val, color: cfg?.border ?? '#aaa', desc: cfg?.desc ?? key });
    }
  });

  return (
    <>
      {/* 방어력 — HP바 오른쪽 옆 */}
      {(playerStatus.shield > 0 || playerStatus.resist > 0) && (
        <div style={{
          position: 'absolute',
          left: cx + hpBarRight + 8 * scale,
          top: cy + hpBarY,
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
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
          display: 'flex', gap: 6 * scale, flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: 250 * scale,
        }}>
          {entries.map((entry, idx) => (
            <IconBadge
              key={idx}
              icon={entry.icon}
              label={entry.label}
              value={entry.value}
              color={entry.color}
              desc={entry.desc}
              scale={scale}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const StatusOverlay: React.FC = () => {
  const enemies = useBattleStore(s => s.enemies);
  const relics = useRunStore(s => s.relics);
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
          total={enemies.length}
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
