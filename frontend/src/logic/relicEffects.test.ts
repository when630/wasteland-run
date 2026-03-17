import { describe, it, expect } from 'vitest';
import {
  onBattleStart, onBattleReset, onRestOrEventEnter,
  onEnemyKilledBySpecial, onEnemyKilledByPhysical, onEnemyKilled,
  onFatalDamage, onCardPlayed, getPassiveDamageBonus, onTurnStart,
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

  it('강화 장갑 + 물리 방어 → bonusShield 3', () => {
    const card = { type: 'PHYSICAL_DEFENSE' } as Card;
    const r = onCardPlayed(['reinforced_gloves'], card);
    expect(r.bonusShield).toBe(3);
  });

  it('납판 삽입물 + 특수 방어 → bonusResist 3', () => {
    const card = { type: 'SPECIAL_DEFENSE' } as Card;
    const r = onCardPlayed(['lead_insert'], card);
    expect(r.bonusResist).toBe(3);
  });

  it('가시 어깨받이 + 물리 방어 → spikedDamage 3', () => {
    const card = { type: 'PHYSICAL_DEFENSE' } as Card;
    const r = onCardPlayed(['spiked_pauldron'], card);
    expect(r.spikedDamage).toBe(3);
  });

  it('재생 연고 + 특수 방어 → healAmount 2', () => {
    const card = { type: 'SPECIAL_DEFENSE' } as Card;
    const r = onCardPlayed(['regen_salve'], card);
    expect(r.healAmount).toBe(2);
  });
});

describe('onBattleStart 추가', () => {
  it('철모 → 특수 방어도(resist) 6', () => {
    const r = onBattleStart(['steel_helmet'], 'BATTLE');
    expect(r.resist).toBe(6);
  });

  it('응급 붕대 → 체력 4 회복', () => {
    const r = onBattleStart(['emergency_bandage'], 'BATTLE');
    expect(r.healAmount).toBe(4);
  });

  it('즉석 함정 → 적 전체 취약 1턴', () => {
    const r = onBattleStart(['makeshift_trap'], 'BATTLE');
    expect(r.vulnerableAllEnemies).toBe(1);
  });

  it('폐허의 부적 → 적 전체 약화 1턴', () => {
    const r = onBattleStart(['ruin_charm'], 'BATTLE');
    expect(r.weakAllEnemies).toBe(1);
  });

  it('대형 탄약통 → 탄약 3', () => {
    const r = onBattleStart(['large_ammo_case'], 'BATTLE');
    expect(r.ammo).toBe(3);
  });
});

describe('getPassiveDamageBonus', () => {
  it('빈 유물 → 0/0/0', () => {
    const r = getPassiveDamageBonus([], 50, 100);
    expect(r.physicalBonus).toBe(0);
    expect(r.specialBonus).toBe(0);
    expect(r.singleTargetBonus).toBe(0);
  });

  it('녹슨 너클 → 물리 +2', () => {
    const r = getPassiveDamageBonus(['rusty_knuckle'], 50, 100);
    expect(r.physicalBonus).toBe(2);
  });

  it('즉석 소음기 → 특수 +2', () => {
    const r = getPassiveDamageBonus(['makeshift_silencer'], 50, 100);
    expect(r.specialBonus).toBe(2);
  });

  it('조준경 → 단일 타겟 +3', () => {
    const r = getPassiveDamageBonus(['scope'], 50, 100);
    expect(r.singleTargetBonus).toBe(3);
  });

  it('광전사 문양 → HP 50% 이하 시 물리+특수 +3', () => {
    const low = getPassiveDamageBonus(['berserker_mark'], 30, 100);
    expect(low.physicalBonus).toBe(3);
    expect(low.specialBonus).toBe(3);

    const high = getPassiveDamageBonus(['berserker_mark'], 80, 100);
    expect(high.physicalBonus).toBe(0);
    expect(high.specialBonus).toBe(0);
  });

  it('고대 전투 보철 → 물리 +4', () => {
    const r = getPassiveDamageBonus(['ancient_prosthetic'], 50, 100);
    expect(r.physicalBonus).toBe(4);
  });

  it('복합 유물 조합', () => {
    const r = getPassiveDamageBonus(['rusty_knuckle', 'scope', 'berserker_mark'], 20, 100);
    expect(r.physicalBonus).toBe(5); // 2 + 3
    expect(r.specialBonus).toBe(3);
    expect(r.singleTargetBonus).toBe(3);
  });
});

describe('onEnemyKilledByPhysical', () => {
  it('용접 건틀릿 → 스플래시 4', () => {
    const r = onEnemyKilledByPhysical(['welding_gauntlet']);
    expect(r.splashDamage).toBe(4);
  });

  it('해당 유물 없으면 0', () => {
    const r = onEnemyKilledByPhysical([]);
    expect(r.splashDamage).toBe(0);
  });
});

describe('onEnemyKilled', () => {
  it('탄약 자석 → 탄약 1', () => {
    const r = onEnemyKilled(['ammo_magnet']);
    expect(r.ammo).toBe(1);
  });

  it('해당 유물 없으면 0', () => {
    const r = onEnemyKilled([]);
    expect(r.ammo).toBe(0);
  });
});

describe('onTurnStart', () => {
  it('빈 유물 → 기본값', () => {
    const r = onTurnStart([], 1, 50, 100);
    expect(r.ammo).toBe(0);
    expect(r.extraDraw).toBe(0);
    expect(r.selfDamage).toBe(0);
  });

  it('소형 배터리 → 짝수 턴에 탄약 +1', () => {
    expect(onTurnStart(['small_battery'], 2, 50, 100).ammo).toBe(1);
    expect(onTurnStart(['small_battery'], 3, 50, 100).ammo).toBe(0);
  });

  it('화기 정비 키트 → 매턴 탄약 +1', () => {
    expect(onTurnStart(['weapon_maintenance_kit'], 1, 50, 100).ammo).toBe(1);
  });

  it('전술 HUD → 매턴 드로우 +1', () => {
    expect(onTurnStart(['tactical_hud'], 1, 50, 100).extraDraw).toBe(1);
  });

  it('해골 부적 → HP 50% 이하 드로우 +1', () => {
    expect(onTurnStart(['skull_charm'], 1, 40, 100).extraDraw).toBe(1);
    expect(onTurnStart(['skull_charm'], 1, 80, 100).extraDraw).toBe(0);
  });

  it('아드레날린 주입기 → 자해 3', () => {
    expect(onTurnStart(['adrenaline_injector'], 1, 50, 100).selfDamage).toBe(3);
  });

  it('돌연변이 발톱 → 랜덤 적 3 피해', () => {
    expect(onTurnStart(['mutant_claw'], 1, 50, 100).randomEnemyDamage).toBe(3);
  });
});

describe('onRestOrEventEnter 추가', () => {
  it('통조림 식량 → 휴식 회복 보너스 +30%', () => {
    const r = onRestOrEventEnter(['canned_food'], 100);
    expect(r.restHealBonus).toBe(0.3);
  });

  it('만능 수리 도구 → 카드 제거 가능', () => {
    const r = onRestOrEventEnter(['universal_repair_tool'], 100);
    expect(r.canRemoveCard).toBe(true);
  });

  it('유물 없으면 카드 제거 불가', () => {
    const r = onRestOrEventEnter([], 100);
    expect(r.canRemoveCard).toBe(false);
    expect(r.restHealBonus).toBe(0);
  });
});
