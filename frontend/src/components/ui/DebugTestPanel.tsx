import React, { useState } from 'react';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useRunStore } from '../../store/useRunStore';
import { createEnemy, BASE_ENEMIES } from '../../assets/data/enemies';
import { ALL_CARDS, createStartingDeck } from '../../assets/data/cards';
import { RELICS } from '../../assets/data/relics';
import type { Card } from '../../types/gameTypes';
import { iconClose } from '../../assets/images/GUI';

// ── 섹션 헤더 ──
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div style={{
    fontSize: '11px', fontWeight: 'bold', color: '#ffd700',
    borderBottom: '1px solid #444', paddingBottom: '3px', marginTop: '8px',
    letterSpacing: '0.05em', textTransform: 'uppercase',
  }}>
    {title}
  </div>
);

// ── 버튼 컴포넌트 ──
const Btn: React.FC<{
  label: string; onClick: () => void;
  color?: string; bg?: string; flex?: boolean; small?: boolean;
}> = ({ label, onClick, color = '#fff', bg = '#333', flex, small }) => (
  <button
    onClick={onClick}
    style={{
      padding: small ? '2px 6px' : '4px 8px',
      fontSize: small ? '10px' : '11px',
      fontWeight: 'bold',
      color, backgroundColor: bg,
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '3px',
      cursor: 'pointer',
      flex: flex ? '1' : undefined,
      whiteSpace: 'nowrap',
      transition: 'filter 0.15s',
      fontFamily: 'monospace',
    }}
    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
  >
    {label}
  </button>
);

// ── 숫자 조절 행 ──
const NumRow: React.FC<{
  label: string; value: string | number;
  onMinus: () => void; onPlus: () => void;
  minusLabel?: string; plusLabel?: string;
  color?: string;
}> = ({ label, value, onMinus, onPlus, minusLabel = '-', plusLabel = '+', color = '#ccc' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    <span style={{ fontSize: '11px', color, flex: 1, minWidth: '60px' }}>{label}</span>
    <Btn label={minusLabel} onClick={onMinus} bg="#522" color="#f88" small />
    <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', minWidth: '28px', textAlign: 'center' }}>{value}</span>
    <Btn label={plusLabel} onClick={onPlus} bg="#252" color="#8f8" small />
  </div>
);

// ── 적 목록 (소환용) ──
const ENEMY_GROUPS = [
  { label: 'Ch1 일반', ids: ['scrap_collector', 'acid_dog', 'waste_slime', 'radiation_spider', 'rust_marauder', 'scrap_turret'] },
  { label: 'Ch1 엘리트', ids: ['mutant_behemoth', 'rogue_sentry', 'mutant_sniper'] },
  { label: 'Ch1 보스', ids: ['brutus'] },
  { label: 'Ch2 일반', ids: ['subway_rat', 'rail_crawler', 'mole_person', 'tunnel_spider', 'electric_slime', 'rusted_golem'] },
  { label: 'Ch2 엘리트', ids: ['derailed_conductor', 'shadow_lurker', 'track_guardian'] },
  { label: 'Ch2 보스', ids: ['leviathan_worm'] },
  { label: 'Ch3 일반', ids: ['security_drone', 'bio_experiment', 'corporate_guard', 'nano_swarm', 'cryo_sentinel', 'hazmat_worker'] },
  { label: 'Ch3 엘리트', ids: ['chief_scientist', 'war_machine'] },
  { label: 'Ch3 보스', ids: ['director_omega'] },
];

export const DebugTestPanel: React.FC<{
  onReset: () => void;
  onExit: () => void;
}> = ({ onReset, onExit }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [enemySection, setEnemySection] = useState(false);
  const [spawnSection, setSpawnSection] = useState(false);
  const [cardSection, setCardSection] = useState(false);
  const [cardSearch, setCardSearch] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState<string>('ALL');
  const [relicSection, setRelicSection] = useState(false);
  const [relicTierFilter, setRelicTierFilter] = useState<string>('ALL');

  // ── 스토어 구독 (반응형) ──
  const ap = useBattleStore(s => s.playerActionPoints);
  const ammo = useBattleStore(s => s.playerAmmo);
  const playerStatus = useBattleStore(s => s.playerStatus);
  const playerDebuffs = useBattleStore(s => s.playerDebuffs);
  const enemies = useBattleStore(s => s.enemies);
  const powerDefenseAmmo50 = useBattleStore(s => s.powerDefenseAmmo50);
  const powerPhysicalScalingActive = useBattleStore(s => s.powerPhysicalScalingActive);
  const powerPhysicalScalingBonus = useBattleStore(s => s.powerPhysicalScalingBonus);
  const playerHp = useRunStore(s => s.playerHp);
  const relics = useRunStore(s => s.relics);
  const handCount = useDeckStore(s => s.hand.length);
  const drawCount = useDeckStore(s => s.drawPile.length);
  const discardCount = useDeckStore(s => s.discardPile.length);

  const firstAlive = enemies.find(e => e.currentHp > 0);

  // ── 플레이어 자원 조작 ──
  const modAp = (d: number) => useBattleStore.setState(s => ({ playerActionPoints: Math.max(0, s.playerActionPoints + d) }));
  const modAmmo = (d: number) => useBattleStore.setState(s => ({ playerAmmo: Math.max(0, s.playerAmmo + d) }));
  const modHp = (d: number) => useRunStore.setState(s => ({ playerHp: Math.max(1, Math.min(s.playerMaxHp, s.playerHp + d)) }));
  const modShield = (d: number) => useBattleStore.setState(s => ({ playerStatus: { ...s.playerStatus, shield: Math.max(0, s.playerStatus.shield + d) } }));
  const modResist = (d: number) => useBattleStore.setState(s => ({ playerStatus: { ...s.playerStatus, resist: Math.max(0, s.playerStatus.resist + d) } }));

  // ── 플레이어 버프 ──
  const setBuff = (field: string, val: boolean | number) => useBattleStore.setState(s => ({ playerStatus: { ...s.playerStatus, [field]: val } }));
  const modBuff = (field: string, d: number) => useBattleStore.setState(s => {
    const cur = (s.playerStatus as unknown as Record<string, number>)[field] || 0;
    return { playerStatus: { ...s.playerStatus, [field]: Math.max(0, cur + d) } };
  });

  // ── 플레이어 디버프 ──
  const modPlayerDebuff = (status: string, d: number) => useBattleStore.setState(s => {
    const cur = s.playerDebuffs[status] || 0;
    const next = Math.max(0, cur + d);
    const nd = { ...s.playerDebuffs };
    if (next <= 0) delete nd[status]; else nd[status] = next;
    return { playerDebuffs: nd };
  });

  // ── 적 조작 ──
  const modEnemyStatus = (status: string, d: number) => {
    if (!firstAlive) return;
    const tid = firstAlive.id;
    useBattleStore.setState(s => ({
      enemies: s.enemies.map(e => {
        if (e.id !== tid) return e;
        const cur = e.statuses?.[status] || 0;
        const next = Math.max(0, cur + d);
        const ns = { ...e.statuses };
        if (next <= 0) delete ns[status]; else ns[status] = next;
        return { ...e, statuses: ns };
      })
    }));
  };

  const modEnemyField = (field: 'shield' | 'resist', d: number) => {
    if (!firstAlive) return;
    const tid = firstAlive.id;
    useBattleStore.setState(s => ({
      enemies: s.enemies.map(e => e.id !== tid ? e : { ...e, [field]: Math.max(0, e[field] + d) })
    }));
  };

  const modEnemyHp = (d: number) => {
    if (!firstAlive) return;
    const tid = firstAlive.id;
    useBattleStore.setState(s => ({
      enemies: s.enemies.map(e => e.id !== tid ? e : { ...e, currentHp: Math.max(1, Math.min(e.maxHp, e.currentHp + d)) })
    }));
  };

  const killAll = () => {
    const st = useBattleStore.getState();
    st.enemies.forEach(e => { if (e.currentHp > 0) st.applyDamageToEnemy(e.id, 9999, 'PIERCING'); });
  };

  const spawnNewEnemy = (baseId: string) => {
    const alive = useBattleStore.getState().enemies.filter(e => e.currentHp > 0);
    if (alive.length >= 3) { useRunStore.getState().setToastMessage('최대 3마리까지만 소환 가능합니다.'); return; }
    useBattleStore.setState(s => ({ enemies: [...s.enemies, createEnemy(baseId)] }));
  };

  const togglePower = (f: 'powerDefenseAmmo50' | 'powerPhysicalScalingActive') =>
    useBattleStore.setState(s => ({ [f]: !s[f] }));

  const resetDeck = () => {
    const ds = useDeckStore.getState();
    ds.setMasterDeck(createStartingDeck());
    ds.initDeck();
    ds.drawCards(5);
    useBattleStore.setState({ playerMaxAp: 99, playerActionPoints: 99, playerAmmo: 99 });
  };

  const addCardToDeck = (blueprint: Partial<Card>, count: number) => {
    const ds = useDeckStore.getState();
    for (let i = 0; i < count; i++) {
      // 마스터덱에도 추가하고, 드로우 파일에도 직접 넣어서 바로 뽑을 수 있게
      ds.addCardToMasterDeck(blueprint as Omit<Card, 'id'>);
    }
    // 마스터덱 마지막 N장을 드로우 파일에도 복사
    const updated = useDeckStore.getState();
    const added = updated.masterDeck.slice(-count);
    useDeckStore.setState(s => ({ drawPile: [...s.drawPile, ...added] }));
  };

  // 유물 등급별 색상/라벨
  const TIER_COLORS: Record<string, string> = {
    ALL: '#aaa', COMMON: '#aaa', UNCOMMON: '#5b8', RARE: '#d93', BOSS: '#c5f',
  };
  const TIER_LABELS: Record<string, string> = {
    ALL: '전체', COMMON: '일반', UNCOMMON: '고급', RARE: '희귀', BOSS: '보스',
  };

  // 카드 타입별 색상
  const TYPE_COLORS: Record<string, string> = {
    PHYSICAL_ATTACK: '#f66', SPECIAL_ATTACK: '#c8a',
    PHYSICAL_DEFENSE: '#6af', SPECIAL_DEFENSE: '#6da',
    UTILITY: '#fd8', STATUS_BURN: '#a55', STATUS_RADIATION: '#5a5',
  };
  const TYPE_LABELS: Record<string, string> = {
    ALL: '전체', PHYSICAL_ATTACK: '물공', SPECIAL_ATTACK: '특공',
    PHYSICAL_DEFENSE: '물방', SPECIAL_DEFENSE: '특방',
    UTILITY: '변화', STATUS_BURN: '화상', STATUS_RADIATION: '방사능',
  };

  // 카드 필터링
  const filteredCards = ALL_CARDS.filter(c => {
    if (cardTypeFilter !== 'ALL' && c.type !== cardTypeFilter) return false;
    if (cardSearch && !c.name?.includes(cardSearch) && !c.baseId?.includes(cardSearch)) return false;
    return true;
  });

  const grantAllRelics = () => {
    const { relics, addRelic } = useRunStore.getState();
    RELICS.forEach(r => { if (!relics.includes(r.id)) addRelic(r.id); });
  };

  // ── 접힌 상태 ──
  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{
        position: 'absolute', top: 10, right: 10, zIndex: 100,
        padding: '6px 14px', fontSize: '12px', fontWeight: 'bold',
        background: '#1a1a2e', color: '#ffd700', border: '1px solid #ffd700',
        borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace',
      }}>
        DEBUG
      </button>
    );
  }

  // ── 버프 목록 ──
  const buffDefs: { label: string; field: string; type: 'bool' | 'num'; value: boolean | number }[] = [
    { label: '무료 물리', field: 'nextPhysicalFree', type: 'bool', value: playerStatus.nextPhysicalFree },
    { label: '물리 금지', field: 'cannotPlayPhysicalAttack', type: 'bool', value: playerStatus.cannotPlayPhysicalAttack },
    { label: '카드유지', field: 'retainCardCount', type: 'num', value: playerStatus.retainCardCount },
    { label: '물리반사', field: 'reflectPhysical', type: 'num', value: playerStatus.reflectPhysical },
    { label: 'AP(특방)', field: 'apOnSpecialDefend', type: 'num', value: playerStatus.apOnSpecialDefend },
    { label: 'Ammo(특방)', field: 'ammoOnSpecialDefend', type: 'num', value: playerStatus.ammoOnSpecialDefend },
  ];

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: '260px',
      zIndex: 100,
      background: 'rgba(10, 10, 20, 0.95)',
      borderLeft: '2px solid #333',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'monospace', color: '#ccc',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px', borderBottom: '2px solid #ffd700',
        background: 'rgba(30, 25, 10, 0.9)',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffd700' }}>DEBUG PANEL</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Btn label="Reset" onClick={onReset} bg="#2a4a2a" color="#8f8" small />
          <Btn label="Exit" onClick={onExit} bg="#4a2a2a" color="#f88" small />
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
            <img src={iconClose} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
          </button>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* ── 플레이어 자원 ── */}
        <SectionHeader title="Player Resources" />
        <NumRow label="AP" value={ap} onMinus={() => modAp(-1)} onPlus={() => modAp(1)} />
        <NumRow label="Ammo" value={ammo} onMinus={() => modAmmo(-1)} onPlus={() => modAmmo(1)} />
        <NumRow label="HP" value={playerHp} onMinus={() => modHp(-10)} onPlus={() => modHp(10)} minusLabel="-10" plusLabel="+10" />
        <NumRow label="Shield" value={playerStatus.shield} onMinus={() => modShield(-5)} onPlus={() => modShield(5)} minusLabel="-5" plusLabel="+5" />
        <NumRow label="Resist" value={playerStatus.resist} onMinus={() => modResist(-5)} onPlus={() => modResist(5)} minusLabel="-5" plusLabel="+5" />
        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
          <Btn label="AP = 99" onClick={() => useBattleStore.setState({ playerMaxAp: 99, playerActionPoints: 99 })} bg="#335" color="#8bf" flex />
          <Btn label="Ammo = 99" onClick={() => useBattleStore.setState({ playerAmmo: 99 })} bg="#335" color="#8bf" flex />
        </div>

        {/* ── 플레이어 버프 ── */}
        <SectionHeader title="Player Buffs" />
        {buffDefs.map(b => (
          b.type === 'bool' ? (
            <div key={b.field} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', flex: 1 }}>{b.label}</span>
              <Btn
                label={b.value ? 'ON' : 'OFF'}
                onClick={() => setBuff(b.field, !b.value)}
                bg={b.value ? '#254' : '#432'} color={b.value ? '#8f8' : '#f88'} small
              />
            </div>
          ) : (
            <NumRow key={b.field} label={b.label} value={b.value as number}
              onMinus={() => modBuff(b.field, -1)} onPlus={() => modBuff(b.field, 1)} />
          )
        ))}

        {/* 파워 (영구 버프) */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
          <Btn
            label={`방어탄약 ${powerDefenseAmmo50 ? 'ON' : 'OFF'}`}
            onClick={() => togglePower('powerDefenseAmmo50')}
            bg={powerDefenseAmmo50 ? '#254' : '#333'} color={powerDefenseAmmo50 ? '#8f8' : '#888'} flex
          />
          <Btn
            label={`물리스케일 ${powerPhysicalScalingActive ? 'ON' : 'OFF'}`}
            onClick={() => togglePower('powerPhysicalScalingActive')}
            bg={powerPhysicalScalingActive ? '#254' : '#333'} color={powerPhysicalScalingActive ? '#8f8' : '#888'} flex
          />
        </div>
        <NumRow label="물리보너스" value={powerPhysicalScalingBonus}
          onMinus={() => useBattleStore.setState(s => ({ powerPhysicalScalingBonus: Math.max(0, s.powerPhysicalScalingBonus - 1) }))}
          onPlus={() => useBattleStore.setState(s => ({ powerPhysicalScalingBonus: s.powerPhysicalScalingBonus + 1 }))} />

        {/* ── 플레이어 디버프 ── */}
        <SectionHeader title="Player Debuffs" />
        {['VULNERABLE', 'WEAK'].map(status => (
          <NumRow key={status} label={status === 'VULNERABLE' ? '취약' : '약화'}
            value={playerDebuffs[status] || 0}
            onMinus={() => modPlayerDebuff(status, -1)} onPlus={() => modPlayerDebuff(status, 1)}
            color={status === 'VULNERABLE' ? '#f8a' : '#8af'} />
        ))}

        {/* ── 적 제어 ── */}
        <SectionHeader title="Enemy Control" />
        {firstAlive && (
          <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>
            Target: {firstAlive.name} (HP {firstAlive.currentHp}/{firstAlive.maxHp})
          </div>
        )}
        <button onClick={() => setEnemySection(!enemySection)} style={{
          background: 'none', border: '1px solid #555', borderRadius: '3px',
          color: '#aaa', fontSize: '11px', padding: '3px 8px', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'monospace',
        }}>
          {enemySection ? '▼' : '▶'} 상태이상/방어
        </button>
        {enemySection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '4px' }}>
            {[
              { label: '취약(VULN)', status: 'VULNERABLE', color: '#f8a' },
              { label: '약화(WEAK)', status: 'WEAK', color: '#8af' },
              { label: '화상(BURN)', status: 'BURN', color: '#fa8' },
              { label: '독(POISON)', status: 'POISON', color: '#8f8' },
            ].map(({ label, status, color }) => (
              <NumRow key={status} label={label} value={firstAlive?.statuses?.[status] || 0}
                onMinus={() => modEnemyStatus(status, -1)} onPlus={() => modEnemyStatus(status, 1)} color={color} />
            ))}
            <NumRow label="Shield" value={firstAlive?.shield || 0} onMinus={() => modEnemyField('shield', -5)} onPlus={() => modEnemyField('shield', 5)} minusLabel="-5" plusLabel="+5" />
            <NumRow label="Resist" value={firstAlive?.resist || 0} onMinus={() => modEnemyField('resist', -5)} onPlus={() => modEnemyField('resist', 5)} minusLabel="-5" plusLabel="+5" />
            <NumRow label="HP" value={firstAlive?.currentHp || 0} onMinus={() => modEnemyHp(-20)} onPlus={() => modEnemyHp(20)} minusLabel="-20" plusLabel="+20" />
            <Btn label="Kill All" onClick={killAll} bg="#622" color="#f88" />
          </div>
        )}

        {/* 적 소환 */}
        <button onClick={() => setSpawnSection(!spawnSection)} style={{
          background: 'none', border: '1px solid #555', borderRadius: '3px',
          color: '#aaa', fontSize: '11px', padding: '3px 8px', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'monospace',
        }}>
          {spawnSection ? '▼' : '▶'} 적 소환
        </button>
        {spawnSection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '4px' }}>
            <Btn label="Clear All Enemies" onClick={() => useBattleStore.setState({ enemies: [] })} bg="#622" color="#faa" />
            <Btn label="+ 훈련용 허수아비" onClick={() => spawnNewEnemy('training_dummy')} bg="#335" color="#8bf" />
            {ENEMY_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{group.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                  {group.ids.map(id => (
                    <button key={id} onClick={() => spawnNewEnemy(id)} title={BASE_ENEMIES[id]?.name || id}
                      style={{
                        padding: '2px 5px', fontSize: '9px', background: '#2a2a3a', color: '#aaa',
                        border: '1px solid #444', borderRadius: '2px', cursor: 'pointer', fontFamily: 'monospace',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#3a3a4a'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#2a2a3a'; e.currentTarget.style.color = '#aaa'; }}
                    >
                      {BASE_ENEMIES[id]?.name || id}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 카드 / 덱 ── */}
        <SectionHeader title="Deck / Cards" />
        <div style={{ display: 'flex', gap: '4px' }}>
          <Btn label="Draw 1" onClick={() => useDeckStore.getState().drawCards(1)} bg="#335" color="#8bf" flex />
          <Btn label="Draw 5" onClick={() => useDeckStore.getState().drawCards(5)} bg="#335" color="#8bf" flex />
          <Btn label="Draw 10" onClick={() => useDeckStore.getState().drawCards(10)} bg="#335" color="#8bf" flex />
        </div>
        <Btn label="Reset Deck (기본 덱)" onClick={resetDeck} bg="#353" color="#8f8" />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
          Hand: {handCount} | Draw: {drawCount} | Discard: {discardCount}
        </div>

        {/* 카드 추가 브라우저 */}
        <button onClick={() => setCardSection(!cardSection)} style={{
          background: 'none', border: '1px solid #555', borderRadius: '3px',
          color: '#aaa', fontSize: '11px', padding: '3px 8px', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'monospace', marginTop: '2px',
        }}>
          {cardSection ? '▼' : '▶'} 카드 추가
        </button>
        {cardSection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* 검색 */}
            <input
              value={cardSearch}
              onChange={e => setCardSearch(e.target.value)}
              placeholder="카드 이름 검색..."
              style={{
                padding: '3px 6px', fontSize: '11px', fontFamily: 'monospace',
                background: '#1a1a2a', color: '#ddd', border: '1px solid #444',
                borderRadius: '3px', outline: 'none',
              }}
            />
            {/* 타입 필터 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <button key={type} onClick={() => setCardTypeFilter(type)}
                  style={{
                    padding: '1px 5px', fontSize: '9px', fontFamily: 'monospace',
                    background: cardTypeFilter === type ? (TYPE_COLORS[type] || '#555') : '#2a2a3a',
                    color: cardTypeFilter === type ? '#000' : (TYPE_COLORS[type] || '#aaa'),
                    border: `1px solid ${TYPE_COLORS[type] || '#555'}`,
                    borderRadius: '2px', cursor: 'pointer',
                    fontWeight: cardTypeFilter === type ? 'bold' : 'normal',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* 카드 목록 */}
            <div style={{
              maxHeight: '200px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '1px',
              border: '1px solid #333', borderRadius: '3px',
              background: '#0a0a15',
            }}>
              {filteredCards.map(card => (
                <div key={card.baseId} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 6px',
                  borderBottom: '1px solid #1a1a2a',
                }}>
                  <span style={{
                    fontSize: '10px', flex: 1, color: TYPE_COLORS[card.type || ''] || '#ccc',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }} title={`${card.name} — ${card.description}`}>
                    {card.name}
                  </span>
                  <span style={{ fontSize: '9px', color: '#666', flexShrink: 0 }}>
                    {card.costAp}AP{card.costAmmo ? `+${card.costAmmo}A` : ''}
                  </span>
                  <button onClick={() => addCardToDeck(card, 1)} title="덱에 1장 추가"
                    style={{
                      padding: '1px 4px', fontSize: '9px', fontWeight: 'bold',
                      background: '#253', color: '#8f8', border: '1px solid #4a4',
                      borderRadius: '2px', cursor: 'pointer', fontFamily: 'monospace',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#364'}
                    onMouseLeave={e => e.currentTarget.style.background = '#253'}
                  >
                    +1
                  </button>
                  <button onClick={() => addCardToDeck(card, 3)} title="덱에 3장 추가"
                    style={{
                      padding: '1px 4px', fontSize: '9px', fontWeight: 'bold',
                      background: '#335', color: '#8bf', border: '1px solid #44a',
                      borderRadius: '2px', cursor: 'pointer', fontFamily: 'monospace',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#446'}
                    onMouseLeave={e => e.currentTarget.style.background = '#335'}
                  >
                    +3
                  </button>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <div style={{ padding: '8px', fontSize: '10px', color: '#555', textAlign: 'center' }}>
                  검색 결과 없음
                </div>
              )}
            </div>
            <div style={{ fontSize: '9px', color: '#555' }}>
              추가한 카드는 드로우 파일에 들어갑니다. Draw로 뽑으세요.
            </div>
          </div>
        )}

        {/* ── 유물 ── */}
        <SectionHeader title={`Relics (${relics.length}/${RELICS.length})`} />
        <div style={{ display: 'flex', gap: '4px' }}>
          <Btn label="모든 유물 획득" onClick={grantAllRelics} bg="#445" color="#bbf" flex />
          <Btn label="유물 초기화" onClick={() => useRunStore.setState({ relics: [] })} bg="#433" color="#fbb" flex />
        </div>
        {/* 보유 유물 표시 */}
        {relics.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
            {relics.map(rid => {
              const r = RELICS.find(x => x.id === rid);
              return (
                <div key={rid} title={r ? `${r.name}\n${r.description}` : rid}
                  onClick={() => useRunStore.getState().removeRelic(rid)}
                  style={{
                    width: 30, height: 30, borderRadius: '4px',
                    border: `1px solid ${TIER_COLORS[r?.tier || 'COMMON']}`,
                    background: '#1a1a2a', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {r?.image ? (
                    <img src={r.image} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '8px', color: '#888' }}>{rid.slice(0, 3)}</span>
                  )}
                  <div style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#622', border: '1px solid #f88',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '7px', color: '#f88', fontWeight: 'bold',
                  }}>×</div>
                </div>
              );
            })}
          </div>
        )}
        {/* 유물 추가 브라우저 */}
        <button onClick={() => setRelicSection(!relicSection)} style={{
          background: 'none', border: '1px solid #555', borderRadius: '3px',
          color: '#aaa', fontSize: '11px', padding: '3px 8px', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'monospace', marginTop: '2px',
        }}>
          {relicSection ? '▼' : '▶'} 유물 추가
        </button>
        {relicSection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* 등급 필터 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
              {(['ALL', 'COMMON', 'UNCOMMON', 'RARE', 'BOSS'] as const).map(tier => (
                <button key={tier} onClick={() => setRelicTierFilter(tier)}
                  style={{
                    padding: '1px 5px', fontSize: '9px', fontFamily: 'monospace',
                    background: relicTierFilter === tier ? (TIER_COLORS[tier] || '#555') : '#2a2a3a',
                    color: relicTierFilter === tier ? '#000' : (TIER_COLORS[tier] || '#aaa'),
                    border: `1px solid ${TIER_COLORS[tier] || '#555'}`,
                    borderRadius: '2px', cursor: 'pointer',
                    fontWeight: relicTierFilter === tier ? 'bold' : 'normal',
                  }}
                >
                  {TIER_LABELS[tier]}
                </button>
              ))}
            </div>
            {/* 유물 목록 */}
            <div style={{
              maxHeight: '200px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '1px',
              border: '1px solid #333', borderRadius: '3px',
              background: '#0a0a15',
            }}>
              {RELICS.filter(r => relicTierFilter === 'ALL' || r.tier === relicTierFilter).map(r => {
                const owned = relics.includes(r.id);
                return (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 6px',
                    borderBottom: '1px solid #1a1a2a',
                    opacity: owned ? 0.5 : 1,
                  }}>
                    {r.image && (
                      <img src={r.image} alt="" style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{
                        fontSize: '10px', color: TIER_COLORS[r.tier],
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: '8px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (owned) useRunStore.getState().removeRelic(r.id);
                        else useRunStore.getState().addRelic(r.id);
                      }}
                      style={{
                        padding: '1px 5px', fontSize: '9px', fontWeight: 'bold',
                        background: owned ? '#522' : '#253',
                        color: owned ? '#f88' : '#8f8',
                        border: `1px solid ${owned ? '#a44' : '#4a4'}`,
                        borderRadius: '2px', cursor: 'pointer', fontFamily: 'monospace',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    >
                      {owned ? '−' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '9px', color: '#555' }}>
              보유 아이콘 클릭 시 제거 / 목록에서 +/− 토글
            </div>
          </div>
        )}

        {/* ── 기타 ── */}
        <SectionHeader title="Misc" />
        <div style={{ display: 'flex', gap: '4px' }}>
          <Btn label="Gold +100" onClick={() => useRunStore.setState(s => ({ gold: s.gold + 100 }))} bg="#453" color="#fd8" flex />
          <Btn label="Full Heal" onClick={() => useRunStore.setState(s => ({ playerHp: s.playerMaxHp }))} bg="#253" color="#8f8" flex />
        </div>
        <Btn label="Toast Test" onClick={() => useRunStore.getState().setToastMessage('디버그 토스트 메시지 테스트!')} bg="#333" color="#aaa" />
      </div>
    </div>
  );
};
