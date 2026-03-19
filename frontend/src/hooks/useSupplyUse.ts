import { useBattleStore } from '../store/useBattleStore';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';
import { useAudioStore } from '../store/useAudioStore';
import { getSupplyById } from '../assets/data/supplies';
import { resolveSupplyEffect, canUseSupply } from '../logic/supplyEffects';

/**
 * 보급품을 사용할 때 호출하는 커스텀 훅
 * 사용 가능 여부 검증, 효과 적용, 인벤토리 제거를 처리합니다.
 */
export const useSupplyUse = () => {
  const useSupply = (supplyId: string, targetEnemyId?: string): boolean => {
    const run = useRunStore.getState();
    const battle = useBattleStore.getState();
    const deck = useDeckStore.getState();
    const setToast = (msg: string) => useRunStore.getState().setToastMessage(msg);

    // 1. 금욕의 서약 체크
    if (!canUseSupply(run.relics)) {
      setToast('금욕의 서약에 의해 보급품을 사용할 수 없습니다.');
      return false;
    }

    // 2. 보급품 데이터 확인
    const supply = getSupplyById(supplyId);
    if (!supply) return false;

    // 3. 인벤토리에 있는지 확인
    if (!run.supplies.includes(supplyId)) {
      setToast('해당 보급품을 보유하고 있지 않습니다.');
      return false;
    }

    // 4. 사용 컨텍스트 확인
    const isInCombat = ['BATTLE', 'ELITE', 'BOSS', 'DEBUG_BATTLE'].includes(run.currentScene);
    if (!isInCombat && supply.usageContext === 'COMBAT') {
      setToast('이 보급품은 전투 중에만 사용할 수 있습니다.');
      return false;
    }
    if (isInCombat && battle.currentTurn !== 'PLAYER') {
      setToast('적의 차례입니다.');
      return false;
    }

    // 5. 단일 대상 보급품 타겟 검증
    if (supply.id === 'sticky_bomb' && !targetEnemyId) {
      setToast('대상을 선택해주세요.');
      return false;
    }

    // 6. 효과 계산
    const fx = resolveSupplyEffect(supplyId, {
      isInCombat,
      relics: run.relics,
      playerHp: run.playerHp,
      playerMaxHp: run.playerMaxHp,
    });

    // 7. 인벤토리에서 제거
    run.removeSupply(supplyId);

    // 8. 즉시 효과 적용
    // 회복
    const totalHeal = fx.heal + fx.relicBonusHeal;
    if (totalHeal > 0) run.healPlayer(totalHeal);

    // 영구 최대 HP
    if (fx.maxHpBonus > 0) {
      useRunStore.setState(s => ({
        playerMaxHp: s.playerMaxHp + fx.maxHpBonus,
        playerHp: s.playerHp + fx.maxHpBonus,
      }));
    }

    // 전투 중 효과
    if (isInCombat) {
      // AP
      if (fx.ap > 0) {
        useBattleStore.setState(s => ({
          playerActionPoints: s.playerActionPoints + fx.ap,
        }));
      }

      // 탄약
      if (fx.ammo > 0) battle.addAmmo(fx.ammo);

      // 방어도
      if (fx.shield > 0) battle.addPlayerShield(fx.shield);
      if (fx.resist > 0) battle.addPlayerResist(fx.resist);

      // 드로우
      const totalDraw = fx.draw + fx.relicBonusDraw;
      if (totalDraw > 0) deck.drawCards(totalDraw);

      // 적 전체 피해
      if (fx.damageAllEnemies > 0) {
        const livingEnemies = battle.enemies.filter(e => e.currentHp > 0);
        livingEnemies.forEach(e => {
          battle.applyDamageToEnemy(e.id, fx.damageAllEnemies, fx.damageAllEnemiesType);
        });
      }

      // 단일 대상 피해
      if (fx.damageSingleEnemy > 0 && targetEnemyId) {
        battle.applyDamageToEnemy(targetEnemyId, fx.damageSingleEnemy, 'PHYSICAL');
      }

      // 디버프
      if (fx.weakAllEnemies > 0) {
        battle.enemies.filter(e => e.currentHp > 0).forEach(e => {
          battle.applyStatusToEnemy(e.id, 'weak', fx.weakAllEnemies);
        });
      }
      if (fx.vulnerableAllEnemies > 0) {
        battle.enemies.filter(e => e.currentHp > 0).forEach(e => {
          battle.applyStatusToEnemy(e.id, 'vulnerable', fx.vulnerableAllEnemies);
        });
      }

      // 디버프 해제
      if (fx.removeDebuffCount > 0) {
        useBattleStore.setState(s => {
          if (fx.removeDebuffCount >= 99) {
            return { playerDebuffs: {} };
          }
          const keys = Object.keys(s.playerDebuffs);
          if (keys.length === 0) return {};
          const newDebuffs = { ...s.playerDebuffs };
          // 첫 번째 디버프 제거
          delete newDebuffs[keys[0]];
          return { playerDebuffs: newDebuffs };
        });
      }

      // 손패 상태이상 카드 소멸
      if (fx.exhaustStatusFromHand > 0) {
        const hand = useDeckStore.getState().hand;
        const statusCards = hand.filter(c => c.type === 'STATUS_BURN' || c.type === 'STATUS_RADIATION');
        const toExhaust = statusCards.slice(0, fx.exhaustStatusFromHand);
        toExhaust.forEach(c => deck.exhaustCardFromHand(c.id));
      }

      // 덱 전체 상태이상 소멸
      if (fx.purgeStatusCards) {
        const state = useDeckStore.getState();
        // 손패
        state.hand.filter(c => c.type === 'STATUS_BURN' || c.type === 'STATUS_RADIATION').forEach(c => deck.exhaustCardFromHand(c.id));
        // 드로우 더미에서 제거
        useDeckStore.setState(s => ({
          drawPile: s.drawPile.filter(c => c.type !== 'STATUS_BURN' && c.type !== 'STATUS_RADIATION'),
        }));
        // 버림 더미에서 제거
        useDeckStore.setState(s => ({
          discardPile: s.discardPile.filter(c => c.type !== 'STATUS_BURN' && c.type !== 'STATUS_RADIATION'),
        }));
      }

      // 손패 버리고 새로 드로우 (완전 재보급)
      if (fx.discardAndRedraw) {
        deck.discardHand();
        if (fx.fullApRestore) {
          useBattleStore.setState(s => ({ playerActionPoints: s.playerMaxAp }));
        }
        if (fx.fullAmmoRestore > 0) battle.addAmmo(fx.fullAmmoRestore);
        setTimeout(() => useDeckStore.getState().drawCards(5), 100);
      }

      // 임시 최대 HP
      if (fx.tempMaxHpBonus > 0) {
        useRunStore.setState(s => ({
          playerMaxHp: s.playerMaxHp + fx.tempMaxHpBonus,
          playerHp: s.playerHp + fx.tempMaxHpBonus,
        }));
      }

      // 턴 지속 효과 적용
      battle.applySupplyTurnEffects({
        attackBonusTurn: fx.attackBonusTurn || undefined,
        firstSpecialBonus: fx.firstSpecialBonusTurn || undefined,
        dmgReductionFlat: fx.damageReductionFlat || undefined,
        dmgReductionPercent: fx.damageReductionPercent || undefined,
        dmgReductionPercentTurns: fx.damageReductionPercentTurns || undefined,
        regenPerTurn: fx.regenPerTurn || undefined,
        regenTurns: fx.regenTurns || undefined,
        berserkerSelfDmg: fx.berserkerSelfDamage || undefined,
        extraTurn: fx.extraTurn || undefined,
        tempMaxHp: fx.tempMaxHpBonus || undefined,
      });

      // 유물 보너스 드로우 (폐품 증류기)
      if (fx.relicBonusDraw > 0 && fx.draw === 0) {
        deck.drawCards(fx.relicBonusDraw);
      }
    }

    // 9. 사운드 + 토스트
    useAudioStore.getState().playClick();
    setToast(`${supply.name} 사용!`);

    // 10. 세이브
    useRunStore.getState().saveRunData();

    return true;
  };

  return { useSupply };
};
