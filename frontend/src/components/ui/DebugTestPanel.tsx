import React, { useState } from 'react';
import { useBattleStore } from '../../store/useBattleStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useRunStore } from '../../store/useRunStore';
import { createEnemy, BASE_ENEMIES, getEnemyIdsByTier } from '../../assets/data/enemies';
import { ALL_CARDS, createStartingDeck } from '../../assets/data/cards';
import { RELICS } from '../../assets/data/relics';
import { SUPPLIES } from '../../assets/data/supplies';
import type { Card } from '../../types/gameTypes';

// ── 공용 스타일 ──
const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '5px 12px', fontSize: '12px', fontWeight: 'bold',
  fontFamily: '"Galmuri11", monospace', cursor: 'pointer', border: 'none',
  borderBottom: active ? '2px solid #ffd700' : '2px solid transparent',
  background: active ? 'rgba(255, 215, 0, 0.08)' : 'transparent',
  color: active ? '#ffd700' : '#777',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
});

const sectionLabel: React.CSSProperties = {
  fontSize: '11px', fontWeight: 'bold', color: '#999',
  marginTop: '6px', marginBottom: '2px',
};

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '5px 8px', fontSize: '12px', fontFamily: '"Galmuri11", monospace',
  background: '#1a1a2a', color: '#ddd', border: '1px solid #555',
  borderRadius: '4px', cursor: 'pointer', outline: 'none',
};

// ── 버튼 ──
const Btn: React.FC<{
  label: string; onClick: () => void;
  color?: string; bg?: string; flex?: boolean;
}> = ({ label, onClick, color = '#fff', bg = '#333', flex }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px 10px', fontSize: '12px', fontWeight: 'bold',
      color, backgroundColor: bg,
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '4px', cursor: 'pointer',
      flex: flex ? '1' : undefined,
      whiteSpace: 'nowrap', transition: 'filter 0.15s',
      fontFamily: '"Galmuri11", monospace',
    }}
    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
  >
    {label}
  </button>
);

// ── 숫자 조절 ──
const NumRow: React.FC<{
  label: string; value: string | number;
  onMinus: () => void; onPlus: () => void;
  minusLabel?: string; plusLabel?: string; color?: string;
}> = ({ label, value, onMinus, onPlus, minusLabel = '-', plusLabel = '+', color = '#ccc' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '26px' }}>
    <span style={{ fontSize: '12px', color, flex: 1 }}>{label}</span>
    <button onClick={onMinus} style={{ width: 28, height: 24, fontSize: '13px', fontWeight: 'bold', background: '#422', color: '#f88', border: '1px solid #644', borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace' }}>{minusLabel}</button>
    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold', width: '32px', textAlign: 'center' }}>{value}</span>
    <button onClick={onPlus} style={{ width: 28, height: 24, fontSize: '13px', fontWeight: 'bold', background: '#242', color: '#8f8', border: '1px solid #464', borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace' }}>{plusLabel}</button>
  </div>
);

// ── 적 그룹 ──
const ENEMY_GROUPS = [
  { label: '1장 일반', ids: ['scrap_collector', 'acid_dog', 'waste_slime', 'radiation_spider', 'rust_marauder', 'scrap_turret'] },
  { label: '1장 엘리트', ids: ['mutant_behemoth', 'rogue_sentry', 'mutant_sniper'] },
  { label: '1장 보스', ids: ['brutus'] },
  { label: '2장 일반', ids: ['subway_rat', 'rail_crawler', 'mole_person', 'tunnel_spider', 'electric_slime', 'rusted_golem'] },
  { label: '2장 엘리트', ids: ['derailed_conductor', 'shadow_lurker', 'track_guardian'] },
  { label: '2장 보스', ids: ['leviathan_worm'] },
  { label: '3장 일반', ids: ['security_drone', 'bio_experiment', 'corporate_guard', 'nano_swarm', 'cryo_sentinel', 'hazmat_worker'] },
  { label: '3장 엘리트', ids: ['chief_scientist', 'war_machine'] },
  { label: '3장 보스', ids: ['director_omega'] },
];

// ── 의도 프리셋 ──
const INTENT_MAP: Record<string, { type: string; amount?: number; damageType?: string; description: string }> = {
  IDLE: { type: 'DEFEND', description: '대기 중' },
  PHYS_5: { type: 'ATTACK', amount: 5, damageType: 'PHYSICAL', description: '물리 공격 5' },
  PHYS_10: { type: 'ATTACK', amount: 10, damageType: 'PHYSICAL', description: '물리 공격 10' },
  PHYS_20: { type: 'ATTACK', amount: 20, damageType: 'PHYSICAL', description: '물리 공격 20' },
  PHYS_30: { type: 'ATTACK', amount: 30, damageType: 'PHYSICAL', description: '물리 공격 30' },
  SPEC_5: { type: 'ATTACK', amount: 5, damageType: 'SPECIAL', description: '특수 공격 5' },
  SPEC_10: { type: 'ATTACK', amount: 10, damageType: 'SPECIAL', description: '특수 공격 10' },
  SPEC_20: { type: 'ATTACK', amount: 20, damageType: 'SPECIAL', description: '특수 공격 20' },
  SPEC_30: { type: 'ATTACK', amount: 30, damageType: 'SPECIAL', description: '특수 공격 30' },
  BUFF_5: { type: 'BUFF', amount: 5, description: '방어도 5 증가' },
  BUFF_10: { type: 'BUFF', amount: 10, description: '방어도 10 증가' },
  BUFF_20: { type: 'BUFF', amount: 20, description: '방어도 20 증가' },
};

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
const TIER_COLORS: Record<string, string> = {
  ALL: '#aaa', COMMON: '#aaa', UNCOMMON: '#5b8', RARE: '#d93', BOSS: '#c5f',
};

const SUPPLY_TIER_COLORS: Record<string, string> = {
  ALL: '#aaa', COMMON: '#a8b8a0', UNCOMMON: '#5ca8d4', RARE: '#d4a854',
};

type TabId = 'scenario' | 'enemy' | 'player' | 'cards' | 'relics' | 'supply';

// ── 메인 컴포넌트 ──
export const DebugTestPanel: React.FC<{
  onReset: () => void;
  onExit: () => void;
}> = ({ onReset, onExit }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [tab, setTab] = useState<TabId>('scenario');
  const [intentPreset, setIntentPreset] = useState('IDLE');
  const [cardSearch, setCardSearch] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState('ALL');
  const [relicTierFilter, setRelicTierFilter] = useState('ALL');
  const [supplyTierFilter, setSupplyTierFilter] = useState('ALL');

  // 스토어
  const ap = useBattleStore(s => s.playerActionPoints);
  const ammo = useBattleStore(s => s.playerAmmo);
  const playerStatus = useBattleStore(s => s.playerStatus);
  const playerDebuffs = useBattleStore(s => s.playerDebuffs);
  const enemies = useBattleStore(s => s.enemies);
  const playerHp = useRunStore(s => s.playerHp);
  const relics = useRunStore(s => s.relics);
  const supplies = useRunStore(s => s.supplies);
  const masterDeck = useDeckStore(s => s.masterDeck);
  const handCount = useDeckStore(s => s.hand.length);
  const drawCount = useDeckStore(s => s.drawPile.length);
  const discardCount = useDeckStore(s => s.discardPile.length);
  const exhaustCount = useDeckStore(s => s.exhaustPile.length);

  const firstAlive = enemies.find(e => e.currentHp > 0);

  // 조작 함수
  const modAp = (d: number) => useBattleStore.setState(s => ({ playerActionPoints: Math.max(0, s.playerActionPoints + d) }));
  const modAmmo = (d: number) => useBattleStore.setState(s => ({ playerAmmo: Math.max(0, s.playerAmmo + d) }));
  const modHp = (d: number) => useRunStore.setState(s => ({ playerHp: Math.max(1, Math.min(s.playerMaxHp, s.playerHp + d)) }));
  const modShield = (d: number) => useBattleStore.setState(s => ({ playerStatus: { ...s.playerStatus, shield: Math.max(0, s.playerStatus.shield + d) } }));
  const modResist = (d: number) => useBattleStore.setState(s => ({ playerStatus: { ...s.playerStatus, resist: Math.max(0, s.playerStatus.resist + d) } }));

  const modPlayerDebuff = (status: string, d: number) => useBattleStore.setState(s => {
    const cur = s.playerDebuffs[status] || 0;
    const next = Math.max(0, cur + d);
    const nd = { ...s.playerDebuffs };
    if (next <= 0) delete nd[status]; else nd[status] = next;
    return { playerDebuffs: nd };
  });

  const modEnemyStatus = (status: string, d: number) => {
    if (!firstAlive) return;
    const tid = firstAlive.id;
    useBattleStore.setState(s => ({
      enemies: s.enemies.map(e => {
        if (e.id !== tid) return e;
        const ns = { ...e.statuses };
        const next = Math.max(0, (ns[status] || 0) + d);
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

  const applyIntent = (val: string) => {
    setIntentPreset(val);
    const intent = INTENT_MAP[val];
    if (intent) {
      useBattleStore.setState(s => ({
        enemies: s.enemies.map(e => e.currentHp <= 0 ? e : { ...e, currentIntent: intent as any }),
      }));
    }
  };

  const spawnNewEnemy = (baseId: string) => {
    const alive = useBattleStore.getState().enemies.filter(e => e.currentHp > 0);
    if (alive.length >= 3) { useRunStore.getState().setToastMessage('최대 3마리까지만 소환 가능'); return; }
    const enemy = createEnemy(baseId);
    enemy.currentIntent = INTENT_MAP[intentPreset] as any ?? { type: 'DEFEND', description: '대기 중' };
    useBattleStore.setState(s => ({ enemies: [...s.enemies, enemy] }));
  };

  const addCardToDeck = (blueprint: Partial<Card>, count: number) => {
    const ds = useDeckStore.getState();
    for (let i = 0; i < count; i++) ds.addCardToMasterDeck(blueprint as Omit<Card, 'id'>);
    const updated = useDeckStore.getState();
    const added = updated.masterDeck.slice(-count);
    useDeckStore.setState(s => ({ drawPile: [...s.drawPile, ...added] }));
  };

  const filteredCards = ALL_CARDS.filter(c => {
    if (cardTypeFilter !== 'ALL' && c.type !== cardTypeFilter) return false;
    if (cardSearch && !c.name?.includes(cardSearch) && !c.baseId?.includes(cardSearch)) return false;
    return true;
  });

  const toggleBtnStyle: React.CSSProperties = {
    position: 'absolute', left: '50%', transform: 'translateX(-50%)', zIndex: 101,
    padding: '2px 16px', fontSize: '14px', fontWeight: 'bold', lineHeight: '1',
    background: 'rgba(20,20,40,0.9)', color: '#ffd700',
    border: '1px solid #ffd700', borderTop: 'none',
    borderRadius: '0 0 6px 6px',
    cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
  };

  // ── 접힌 상태 ──
  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{ ...toggleBtnStyle, top: 0 }}>
        ▼
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      zIndex: 100,
    }}>
    <div style={{
      background: 'rgba(10, 10, 20, 0.96)',
      borderBottom: '2px solid #444',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Galmuri11", monospace', color: '#ccc',
      maxHeight: '50vh', overflow: 'hidden',
    }}>
      {/* 헤더: 타이틀 + 탭 + 버튼을 한 줄에 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '4px 12px', borderBottom: '1px solid #444',
        background: 'rgba(30, 25, 10, 0.9)', gap: '12px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffd700', flexShrink: 0 }}>연습</span>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {([
            ['scenario', '시나리오'],
            ['enemy', '적'],
            ['player', '플레이어'],
            ['cards', '카드'],
            ['relics', '유물'],
            ['supply', '보급품'],
          ] as [TabId, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabBtnStyle(tab === id)}>{label}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <Btn label="초기화" onClick={onReset} bg="#2a4a2a" color="#8f8" />
          <Btn label="나가기" onClick={onExit} bg="#4a2a2a" color="#f88" />
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ overflowY: 'auto', overflowX: 'hidden', padding: '6px 12px' }}>

        {/* ════ 시나리오 탭 ════ */}
        {tab === 'scenario' && (() => {
          const scenarioBtnStyle = (bg: string, color: string): React.CSSProperties => ({
            padding: '8px 12px', fontSize: '12px', fontWeight: 'bold',
            fontFamily: '"Galmuri11", monospace', cursor: 'pointer',
            background: bg, color, border: `1px solid ${color}33`,
            borderRadius: '6px', transition: 'filter 0.15s', textAlign: 'left',
          });

          const setupBattle = (chapter: number, tier: 'NORMAL' | 'ELITE' | 'BOSS') => {
            useRunStore.setState({ currentChapter: chapter });
            useBattleStore.getState().resetBattle();
            useDeckStore.getState().setMasterDeck(createStartingDeck());
            useDeckStore.getState().initDeck();
            useDeckStore.getState().drawCards(5);
            const ids = getEnemyIdsByTier(tier, chapter);
            if (tier === 'NORMAL') {
              const shuffled = [...ids].sort(() => Math.random() - 0.5);
              useBattleStore.getState().spawnEnemies(shuffled.slice(0, 2).map(id => createEnemy(id)));
            } else {
              const pick = ids[Math.floor(Math.random() * ids.length)];
              useBattleStore.getState().spawnEnemies([createEnemy(pick)]);
            }
            useBattleStore.setState({ playerMaxAp: 4, playerActionPoints: 4, playerAmmo: 3 });
          };

          const goToScene = (scene: 'REST' | 'EVENT' | 'SHOP' | 'TREASURE', chapter: number) => {
            useRunStore.setState({ currentChapter: chapter });
            if (scene === 'SHOP') {
              useRunStore.setState({ gold: 999 });
            }
            useRunStore.getState().setScene(scene);
          };

          return (
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* 전투 시나리오 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={sectionLabel}>전투 시나리오</div>
                {[1, 2, 3].map(ch => (
                  <div key={ch}>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                      {ch}막 — {{ 1: '오염된 외곽 도시', 2: '무너진 지하철도', 3: '거대 기업의 방주' }[ch]}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                      <button onClick={() => setupBattle(ch, 'NORMAL')} style={scenarioBtnStyle('#1a2a1a', '#8c8')}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                        일반전 (x2)
                      </button>
                      <button onClick={() => setupBattle(ch, 'ELITE')} style={scenarioBtnStyle('#2a2a1a', '#cc8')}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                        엘리트전
                      </button>
                      <button onClick={() => setupBattle(ch, 'BOSS')} style={scenarioBtnStyle('#2a1a1a', '#c88')}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                        보스전
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 비전투 씬 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={sectionLabel}>비전투 씬</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                  해당 씬으로 이동합니다. 상단 HUD의 "연습" 버튼으로 돌아올 수 있습니다.
                </div>
                {[1, 2, 3].map(ch => (
                  <div key={ch}>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                      {ch}막
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <button onClick={() => goToScene('REST', ch)} style={scenarioBtnStyle('#1a2a2a', '#8cc')}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                        휴식
                      </button>
                      <button onClick={() => goToScene('EVENT', ch)} style={scenarioBtnStyle('#2a1a2a', '#c8c')}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                        이벤트
                      </button>
                      <button onClick={() => goToScene('SHOP', ch)} style={scenarioBtnStyle('#2a2a1a', '#cc8')}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                        상점
                      </button>
                      <button onClick={() => goToScene('TREASURE', ch)} style={scenarioBtnStyle('#2a1a1a', '#ca8')}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                        보물
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ════ 적 탭 ════ */}
        {tab === 'enemy' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* 좌: 의도 + 상태 */}
            <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={sectionLabel}>다음 턴 행동</div>
              <select value={intentPreset} onChange={e => applyIntent(e.target.value)} style={selectStyle}>
                <option value="IDLE">대기 (아무것도 안함)</option>
                <optgroup label="물리 공격">
                  <option value="PHYS_5">물리 5</option>
                  <option value="PHYS_10">물리 10</option>
                  <option value="PHYS_20">물리 20</option>
                  <option value="PHYS_30">물리 30</option>
                </optgroup>
                <optgroup label="특수 공격">
                  <option value="SPEC_5">특수 5</option>
                  <option value="SPEC_10">특수 10</option>
                  <option value="SPEC_20">특수 20</option>
                  <option value="SPEC_30">특수 30</option>
                </optgroup>
                <optgroup label="버프">
                  <option value="BUFF_5">방어도 +5</option>
                  <option value="BUFF_10">방어도 +10</option>
                  <option value="BUFF_20">방어도 +20</option>
                </optgroup>
              </select>
              {firstAlive && (
                <div style={{ fontSize: '11px', color: '#aaa', padding: '2px 0' }}>
                  {firstAlive.name} — HP {firstAlive.currentHp}/{firstAlive.maxHp}
                  {firstAlive.shield > 0 && <span style={{ color: '#6af' }}> | 방어 {firstAlive.shield}</span>}
                  {firstAlive.resist > 0 && <span style={{ color: '#a8f' }}> | 저항 {firstAlive.resist}</span>}
                </div>
              )}
              <div style={sectionLabel}>적 상태</div>
              <NumRow label="HP" value={firstAlive?.currentHp || 0} onMinus={() => modEnemyHp(-20)} onPlus={() => modEnemyHp(20)} minusLabel="-20" plusLabel="+20" />
              <NumRow label="방어도" value={firstAlive?.shield || 0} onMinus={() => modEnemyField('shield', -5)} onPlus={() => modEnemyField('shield', 5)} minusLabel="-5" plusLabel="+5" />
              <NumRow label="저항도" value={firstAlive?.resist || 0} onMinus={() => modEnemyField('resist', -5)} onPlus={() => modEnemyField('resist', 5)} minusLabel="-5" plusLabel="+5" />
              {[
                { label: '취약', status: 'VULNERABLE', color: '#f8a' },
                { label: '약화', status: 'WEAK', color: '#8af' },
                { label: '화상', status: 'BURN', color: '#fa8' },
                { label: '독', status: 'POISON', color: '#8f8' },
              ].map(({ label, status, color }) => (
                <NumRow key={status} label={label} value={firstAlive?.statuses?.[status] || 0}
                  onMinus={() => modEnemyStatus(status, -1)} onPlus={() => modEnemyStatus(status, 1)} color={color} />
              ))}
              <Btn label="전부 처치" onClick={() => {
                const st = useBattleStore.getState();
                st.enemies.forEach(e => { if (e.currentHp > 0) st.applyDamageToEnemy(e.id, 9999, 'PIERCING'); });
              }} bg="#522" color="#f88" />
            </div>

            {/* 우: 적 소환 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <div style={sectionLabel}>적 소환</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Btn label="모두 제거" onClick={() => useBattleStore.setState({ enemies: [] })} bg="#522" color="#faa" flex />
                <Btn label="+ 허수아비" onClick={() => spawnNewEnemy('training_dummy')} bg="#335" color="#8bf" flex />
              </div>
              {ENEMY_GROUPS.map(group => (
                <div key={group.label}>
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>{group.label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {group.ids.map(id => (
                      <button key={id} onClick={() => spawnNewEnemy(id)} title={BASE_ENEMIES[id]?.name || id}
                        style={{
                          padding: '3px 6px', fontSize: '10px', background: '#2a2a3a', color: '#bbb',
                          border: '1px solid #444', borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#3a3a5a'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#2a2a3a'; e.currentTarget.style.color = '#bbb'; }}
                      >
                        {BASE_ENEMIES[id]?.name || id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ 플레이어 탭 ════ */}
        {tab === 'player' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* 좌: 자원 */}
            <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={sectionLabel}>자원</div>
              <NumRow label="AP" value={ap} onMinus={() => modAp(-1)} onPlus={() => modAp(1)} />
              <NumRow label="탄약" value={ammo} onMinus={() => modAmmo(-1)} onPlus={() => modAmmo(1)} />
              <NumRow label="HP" value={playerHp} onMinus={() => modHp(-10)} onPlus={() => modHp(10)} minusLabel="-10" plusLabel="+10" />
              <NumRow label="방어도" value={playerStatus.shield} onMinus={() => modShield(-5)} onPlus={() => modShield(5)} minusLabel="-5" plusLabel="+5" />
              <NumRow label="저항도" value={playerStatus.resist} onMinus={() => modResist(-5)} onPlus={() => modResist(5)} minusLabel="-5" plusLabel="+5" />
              <div style={{ display: 'flex', gap: '4px' }}>
                <Btn label="AP 99" onClick={() => useBattleStore.setState({ playerMaxAp: 99, playerActionPoints: 99 })} bg="#335" color="#8bf" flex />
                <Btn label="탄약 99" onClick={() => useBattleStore.setState({ playerAmmo: 99 })} bg="#335" color="#8bf" flex />
                <Btn label="만회복" onClick={() => useRunStore.setState(s => ({ playerHp: s.playerMaxHp }))} bg="#253" color="#8f8" flex />
              </div>
            </div>

            {/* 중: 디버프 */}
            <div style={{ flex: '0 0 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={sectionLabel}>디버프</div>
              <NumRow label="취약" value={playerDebuffs['VULNERABLE'] || 0}
                onMinus={() => modPlayerDebuff('VULNERABLE', -1)} onPlus={() => modPlayerDebuff('VULNERABLE', 1)} color="#f8a" />
              <NumRow label="약화" value={playerDebuffs['WEAK'] || 0}
                onMinus={() => modPlayerDebuff('WEAK', -1)} onPlus={() => modPlayerDebuff('WEAK', 1)} color="#8af" />
              <NumRow label="카드유지" value={playerStatus.retainCardCount}
                onMinus={() => useBattleStore.setState(s => ({
                  playerStatus: { ...s.playerStatus, retainCardCount: Math.max(0, s.playerStatus.retainCardCount - 1) }
                }))}
                onPlus={() => useBattleStore.setState(s => ({
                  playerStatus: { ...s.playerStatus, retainCardCount: s.playerStatus.retainCardCount + 1 }
                }))} />
              <NumRow label="물리반사" value={playerStatus.reflectPhysical}
                onMinus={() => useBattleStore.setState(s => ({
                  playerStatus: { ...s.playerStatus, reflectPhysical: Math.max(0, s.playerStatus.reflectPhysical - 1) }
                }))}
                onPlus={() => useBattleStore.setState(s => ({
                  playerStatus: { ...s.playerStatus, reflectPhysical: s.playerStatus.reflectPhysical + 1 }
                }))} />
            </div>

            {/* 우: 버프 토글 */}
            <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={sectionLabel}>버프 토글</div>
              {[
                { label: '무료 물리', field: 'nextPhysicalFree', val: playerStatus.nextPhysicalFree },
                { label: '물리 금지', field: 'cannotPlayPhysicalAttack', val: playerStatus.cannotPlayPhysicalAttack },
              ].map(b => (
                <div key={b.field} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '24px' }}>
                  <span style={{ fontSize: '11px', flex: 1 }}>{b.label}</span>
                  <button
                    onClick={() => useBattleStore.setState(s => ({ playerStatus: { ...s.playerStatus, [b.field]: !b.val } }))}
                    style={{
                      padding: '2px 10px', fontSize: '11px', fontWeight: 'bold',
                      background: b.val ? '#254' : '#333', color: b.val ? '#8f8' : '#888',
                      border: `1px solid ${b.val ? '#4a4' : '#555'}`, borderRadius: '4px',
                      cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
                    }}
                  >{b.val ? 'ON' : 'OFF'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ 카드 탭 ════ */}
        {tab === 'cards' && (() => {
          // 마스터 덱 카드별 수량 집계
          const deckCounts: Record<string, number> = {};
          masterDeck.forEach(c => { deckCounts[c.baseId] = (deckCounts[c.baseId] || 0) + 1; });
          const uniqueDeckCards = Object.entries(deckCounts).map(([baseId, count]) => {
            const card = ALL_CARDS.find(c => c.baseId === baseId) || masterDeck.find(c => c.baseId === baseId);
            return { baseId, count, card };
          }).filter(x => x.card);

          const removeCardFromDeck = (baseId: string) => {
            const ds = useDeckStore.getState();
            const deck = ds.masterDeck;
            const idx = deck.findIndex(c => c.baseId === baseId);
            if (idx === -1) return;
            const next = [...deck];
            next.splice(idx, 1);
            ds.setMasterDeck(next);
            ds.initDeck();
            ds.drawCards(5);
          };

          return (
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* 좌: 보유 덱 */}
              <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={sectionLabel}>보유 덱 ({masterDeck.length}장)</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <Btn label="기본 덱" onClick={() => {
                    const ds = useDeckStore.getState();
                    ds.setMasterDeck(createStartingDeck());
                    ds.initDeck();
                    ds.drawCards(5);
                  }} bg="#353" color="#8f8" flex />
                  <Btn label="전부 제거" onClick={() => {
                    useDeckStore.getState().setMasterDeck([]);
                    useDeckStore.getState().initDeck();
                  }} bg="#433" color="#fbb" flex />
                </div>
                <div style={{ fontSize: '11px', color: '#888', display: 'flex', gap: '8px' }}>
                  <span>손패 {handCount}</span>
                  <span>드로우 {drawCount}</span>
                  <span>버림 {discardCount}</span>
                  <span>소멸 {exhaustCount}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Btn label="1장" onClick={() => useDeckStore.getState().drawCards(1)} bg="#335" color="#8bf" flex />
                  <Btn label="3장" onClick={() => useDeckStore.getState().drawCards(3)} bg="#335" color="#8bf" flex />
                  <Btn label="5장" onClick={() => useDeckStore.getState().drawCards(5)} bg="#335" color="#8bf" flex />
                </div>
                {uniqueDeckCards.length > 0 ? (
                  <div style={{
                    maxHeight: '130px', overflowY: 'auto',
                    border: '1px solid #333', borderRadius: '4px', background: '#0a0a15', padding: '2px',
                  }}>
                    {uniqueDeckCards.map(({ baseId, count, card }) => (
                      <div key={baseId} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '2px 6px', borderBottom: '1px solid #1a1a2a',
                      }}>
                        <span style={{
                          fontSize: '11px', flex: 1, color: TYPE_COLORS[card!.type || ''] || '#ccc',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{card!.name}</span>
                        <span style={{ fontSize: '10px', color: '#888', flexShrink: 0 }}>x{count}</span>
                        <button onClick={() => removeCardFromDeck(baseId)} style={{
                          padding: '1px 5px', fontSize: '10px', fontWeight: 'bold',
                          background: '#522', color: '#f88', border: '1px solid #a44',
                          borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
                        }}>-1</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: '#555', padding: '8px', textAlign: 'center' }}>덱 비어있음</div>
                )}
              </div>

              {/* 우: 카드 추가 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={sectionLabel}>카드 추가</div>
                  <input
                    value={cardSearch} onChange={e => setCardSearch(e.target.value)}
                    placeholder="이름 검색..."
                    style={{ ...selectStyle, width: '120px', padding: '3px 8px', fontSize: '11px' }}
                  />
                  <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                    {Object.entries(TYPE_LABELS).map(([type, label]) => (
                      <button key={type} onClick={() => setCardTypeFilter(type)} style={{
                        padding: '2px 7px', fontSize: '10px', fontFamily: '"Galmuri11", monospace',
                        background: cardTypeFilter === type ? (TYPE_COLORS[type] || '#555') : '#2a2a3a',
                        color: cardTypeFilter === type ? '#000' : (TYPE_COLORS[type] || '#aaa'),
                        border: `1px solid ${TYPE_COLORS[type] || '#555'}`,
                        borderRadius: '3px', cursor: 'pointer',
                        fontWeight: cardTypeFilter === type ? 'bold' : 'normal',
                      }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{
                  maxHeight: '180px', overflowY: 'auto',
                  border: '1px solid #333', borderRadius: '4px', background: '#0a0a15',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                }}>
                  {filteredCards.map(card => {
                    const owned = deckCounts[card.baseId] || 0;
                    return (
                      <div key={card.baseId} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '3px 8px', borderBottom: '1px solid #1a1a2a',
                      }}>
                        <span style={{
                          fontSize: '11px', flex: 1, color: TYPE_COLORS[card.type || ''] || '#ccc',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }} title={`${card.name} — ${card.description}`}>
                          {card.name}
                        </span>
                        <span style={{ fontSize: '10px', color: '#666', flexShrink: 0 }}>
                          {card.costAp}AP{card.costAmmo ? `+${card.costAmmo}A` : ''}
                        </span>
                        {owned > 0 && (
                          <span style={{ fontSize: '9px', color: '#8f8', flexShrink: 0 }}>({owned})</span>
                        )}
                        <button onClick={() => addCardToDeck(card, 1)} style={{
                          padding: '2px 6px', fontSize: '10px', fontWeight: 'bold',
                          background: '#253', color: '#8f8', border: '1px solid #4a4',
                          borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
                        }}>+1</button>
                        <button onClick={() => addCardToDeck(card, 3)} style={{
                          padding: '2px 6px', fontSize: '10px', fontWeight: 'bold',
                          background: '#335', color: '#8bf', border: '1px solid #44a',
                          borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
                        }}>+3</button>
                      </div>
                    );
                  })}
                  {filteredCards.length === 0 && (
                    <div style={{ padding: '12px', fontSize: '11px', color: '#555', textAlign: 'center' }}>검색 결과 없음</div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ════ 유물 탭 ════ */}
        {tab === 'relics' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* 좌: 보유 유물 */}
            <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={sectionLabel}>보유 유물 ({relics.length}/{RELICS.length})</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Btn label="전부 획득" onClick={() => {
                  RELICS.forEach(r => { if (!relics.includes(r.id)) useRunStore.getState().addRelic(r.id); });
                }} bg="#445" color="#bbf" flex />
                <Btn label="전부 제거" onClick={() => useRunStore.setState({ relics: [] })} bg="#433" color="#fbb" flex />
              </div>
              {relics.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {relics.map(rid => {
                    const r = RELICS.find(x => x.id === rid);
                    return (
                      <div key={rid} title={r ? `${r.name}\n${r.description}\n(클릭하여 제거)` : rid}
                        onClick={() => useRunStore.getState().removeRelic(rid)}
                        style={{
                          width: 30, height: 30, borderRadius: '3px',
                          border: `1px solid ${TIER_COLORS[r?.tier || 'COMMON']}`,
                          background: '#1a1a2a', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {r?.image ? (
                          <img src={r.image} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '8px', color: '#888' }}>{rid.slice(0, 3)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 우: 유물 추가 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={sectionLabel}>유물 추가</div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {(['ALL', 'COMMON', 'UNCOMMON', 'RARE', 'BOSS'] as const).map(tier => (
                    <button key={tier} onClick={() => setRelicTierFilter(tier)} style={{
                      padding: '2px 7px', fontSize: '10px', fontFamily: '"Galmuri11", monospace',
                      background: relicTierFilter === tier ? (TIER_COLORS[tier] || '#555') : '#2a2a3a',
                      color: relicTierFilter === tier ? '#000' : (TIER_COLORS[tier] || '#aaa'),
                      border: `1px solid ${TIER_COLORS[tier] || '#555'}`,
                      borderRadius: '3px', cursor: 'pointer',
                      fontWeight: relicTierFilter === tier ? 'bold' : 'normal',
                    }}>
                      {{ ALL: '전체', COMMON: '일반', UNCOMMON: '고급', RARE: '희귀', BOSS: '보스' }[tier]}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{
                maxHeight: '180px', overflowY: 'auto',
                border: '1px solid #333', borderRadius: '4px', background: '#0a0a15',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              }}>
                {RELICS.filter(r => relicTierFilter === 'ALL' || r.tier === relicTierFilter).map(r => {
                  const owned = relics.includes(r.id);
                  return (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '3px 8px', borderBottom: '1px solid #1a1a2a',
                      opacity: owned ? 0.5 : 1,
                    }}>
                      {r.image && <img src={r.image} alt="" style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ fontSize: '11px', color: TIER_COLORS[r.tier], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.name}
                        </div>
                      </div>
                      <button
                        onClick={() => { if (owned) useRunStore.getState().removeRelic(r.id); else useRunStore.getState().addRelic(r.id); }}
                        style={{
                          padding: '2px 8px', fontSize: '10px', fontWeight: 'bold',
                          background: owned ? '#522' : '#253', color: owned ? '#f88' : '#8f8',
                          border: `1px solid ${owned ? '#a44' : '#4a4'}`,
                          borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace', flexShrink: 0,
                        }}
                      >{owned ? '제거' : '추가'}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ 보급품 탭 ════ */}
        {tab === 'supply' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* 좌: 보유 보급품 */}
            <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={sectionLabel}>보유 보급품 ({supplies.length}개)</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Btn label="전부 제거" onClick={() => useRunStore.setState({ supplies: [] })} bg="#433" color="#fbb" flex />
                <Btn label="전부 획득" onClick={() => {
                  const ids = SUPPLIES.map(s => s.id);
                  useRunStore.setState({ supplies: ids });
                }} bg="#445" color="#bbf" flex />
              </div>
              {supplies.length > 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '2px',
                  maxHeight: '160px', overflowY: 'auto',
                  border: '1px solid #333', borderRadius: '4px', background: '#0a0a15', padding: '4px',
                }}>
                  {supplies.map((sid, idx) => {
                    const s = SUPPLIES.find(x => x.id === sid);
                    if (!s) return null;
                    return (
                      <div key={`${sid}-${idx}`} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '3px 6px', borderBottom: '1px solid #1a1a2a',
                      }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
                        <span style={{
                          fontSize: '11px', flex: 1, color: SUPPLY_TIER_COLORS[s.tier],
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }} title={s.description}>{s.name}</span>
                        <button onClick={() => {
                          useRunStore.setState(st => {
                            const next = [...st.supplies];
                            next.splice(idx, 1);
                            return { supplies: next };
                          });
                        }} style={{
                          padding: '2px 6px', fontSize: '10px', fontWeight: 'bold',
                          background: '#522', color: '#f88', border: '1px solid #a44',
                          borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
                        }}>제거</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#555', padding: '8px', textAlign: 'center' }}>보급품 없음</div>
              )}
            </div>

            {/* 우: 보급품 추가 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={sectionLabel}>보급품 추가</div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {(['ALL', 'COMMON', 'UNCOMMON', 'RARE'] as const).map(tier => (
                    <button key={tier} onClick={() => setSupplyTierFilter(tier)} style={{
                      padding: '2px 7px', fontSize: '10px', fontFamily: '"Galmuri11", monospace',
                      background: supplyTierFilter === tier ? (SUPPLY_TIER_COLORS[tier] || '#555') : '#2a2a3a',
                      color: supplyTierFilter === tier ? '#000' : (SUPPLY_TIER_COLORS[tier] || '#aaa'),
                      border: `1px solid ${SUPPLY_TIER_COLORS[tier] || '#555'}`,
                      borderRadius: '3px', cursor: 'pointer',
                      fontWeight: supplyTierFilter === tier ? 'bold' : 'normal',
                    }}>
                      {{ ALL: '전체', COMMON: '일반', UNCOMMON: '고급', RARE: '희귀' }[tier]}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{
                maxHeight: '180px', overflowY: 'auto',
                border: '1px solid #333', borderRadius: '4px', background: '#0a0a15',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              }}>
                {SUPPLIES.filter(s => supplyTierFilter === 'ALL' || s.tier === supplyTierFilter).map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '3px 8px', borderBottom: '1px solid #1a1a2a',
                  }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{
                        fontSize: '11px', color: SUPPLY_TIER_COLORS[s.tier],
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }} title={s.description}>{s.name}</div>
                      <div style={{ fontSize: '9px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.description}
                      </div>
                    </div>
                    <span style={{ fontSize: '9px', color: '#555', flexShrink: 0 }}>
                      {s.usageContext === 'COMBAT' ? '전투' : '항시'}
                    </span>
                    <button onClick={() => useRunStore.getState().addSupply(s.id)} style={{
                      padding: '2px 6px', fontSize: '10px', fontWeight: 'bold',
                      background: '#253', color: '#8f8', border: '1px solid #4a4',
                      borderRadius: '3px', cursor: 'pointer', fontFamily: '"Galmuri11", monospace',
                    }}>+1</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* 닫기 토글 — 패널 바로 아래 중앙 */}
    <button onClick={() => setIsOpen(false)} style={{
      ...toggleBtnStyle, position: 'relative', left: '50%', transform: 'translateX(-50%)',
      top: 'auto', display: 'block',
    }}>
      ▲
    </button>
    </div>
  );
};
