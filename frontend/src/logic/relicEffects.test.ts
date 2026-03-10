import { describe, it, expect } from 'vitest';
import {
  onBattleStart, onBattleReset, onRestOrEventEnter,
  onEnemyKilledBySpecial, onFatalDamage, onCardPlayed,
} from './relicEffects';
import type { Card } from '../types/gameTypes';

describe('onBattleStart', () => {
  it('빈 유물 배열 → 기본값', () => {
    const r = onBattleStart([], 'BATTLE');
    expect(r.ammo).toBe(0);
    expect(r.shield).toBe(0);
    expect(r.extraAp).toBe(0);
    expect(r.extraDraw).toBe(0);
    expect(r.statusCardBaseId).toBeNull();
  });

  it('피 묻은 가죽 탄띠 → 탄약 +1', () => {
    const r = onBattleStart(['bloody_bandolier'], 'BATTLE');
    expect(r.ammo).toBe(1);
  });

  it('구시대의 보안관 배지 → 쉴드 8', () => {
    const r = onBattleStart(['old_sheriff_badge'], 'BATTLE');
    expect(r.shield).toBe(8);
  });

  it('금이 간 황동 나침반 → 엘리트 전투에서만 발동', () => {
    const elite = onBattleStart(['cracked_brass_compass'], 'ELITE');
    expect(elite.extraAp).toBe(2);
    expect(elite.extraDraw).toBe(2);

    const normal = onBattleStart(['cracked_brass_compass'], 'BATTLE');
    expect(normal.extraAp).toBe(0);
    expect(normal.extraDraw).toBe(0);
  });

  it('생체공학 배양 심장 → 방사능 카드 삽입', () => {
    const r = onBattleStart(['bionic_culture_heart'], 'BATTLE');
    expect(r.statusCardBaseId).toBe('status_radiation');
    expect(r.statusCardCount).toBe(2);
  });
});

describe('onBattleReset', () => {
  it('빈 유물 → maxAp 3, startingAp 3', () => {
    const r = onBattleReset([]);
    expect(r.maxAp).toBe(3);
    expect(r.startingAp).toBe(3);
  });

  it('AP 증가 유물 1개 → maxAp 4', () => {
    const r = onBattleReset(['arc_heart']);
    expect(r.maxAp).toBe(4);
    expect(r.startingAp).toBe(4);
  });

  it('야광 시계 → startingAp만 +1', () => {
    const r = onBattleReset(['glow_watch']);
    expect(r.maxAp).toBe(3);
    expect(r.startingAp).toBe(4);
  });
});

describe('onRestOrEventEnter', () => {
  it('불에 탄 작전 지도 → 최대 체력 5% 회복', () => {
    const r = onRestOrEventEnter(['burnt_operation_map'], 100);
    expect(r.healAmount).toBe(5);
  });

  it('균열된 태양석 반응로 → 강화 불가', () => {
    const r = onRestOrEventEnter(['cracked_sunstone_reactor'], 70);
    expect(r.canUpgrade).toBe(false);
  });

  it('일반 → 강화 가능', () => {
    const r = onRestOrEventEnter([], 70);
    expect(r.canUpgrade).toBe(true);
  });
});

describe('onEnemyKilledBySpecial', () => {
  it('구시대의 구급상자 → 체력 3 회복', () => {
    expect(onEnemyKilledBySpecial(['old_medkit'])).toBe(3);
  });

  it('해당 유물 없으면 0', () => {
    expect(onEnemyKilledBySpecial([])).toBe(0);
  });
});

describe('onFatalDamage', () => {
  it('빛바랜 가족사진 → 부활', () => {
    const r = onFatalDamage(['faded_family_photo']);
    expect(r.shouldRevive).toBe(true);
    expect(r.reviveHpPercent).toBe(0.3);
    expect(r.relicToRemove).toBe('faded_family_photo');
  });

  it('해당 유물 없으면 부활 안 함', () => {
    const r = onFatalDamage([]);
    expect(r.shouldRevive).toBe(false);
  });
});

describe('onCardPlayed', () => {
  it('이중 합금 장갑판 + 물리 방어 → bonusResist 2', () => {
    const card = { type: 'PHYSICAL_DEFENSE' } as Card;
    const r = onCardPlayed(['alloy_plating'], card);
    expect(r.bonusResist).toBe(2);
    expect(r.bonusShield).toBe(0);
  });

  it('이중 합금 장갑판 + 특수 방어 → bonusShield 2', () => {
    const card = { type: 'SPECIAL_DEFENSE' } as Card;
    const r = onCardPlayed(['alloy_plating'], card);
    expect(r.bonusShield).toBe(2);
    expect(r.bonusResist).toBe(0);
  });

  it('해당 유물 없으면 기본값', () => {
    const card = { type: 'PHYSICAL_ATTACK' } as Card;
    const r = onCardPlayed([], card);
    expect(r.bonusShield).toBe(0);
    expect(r.bonusResist).toBe(0);
  });
});
