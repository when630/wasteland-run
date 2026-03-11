import type { StateCreator } from 'zustand';
import type { BattleState, EnemySlice } from './types';
import { useRunStore } from '../useRunStore';
import { useDeckStore } from '../useDeckStore';
import { determineNextIntent } from '../../assets/data/enemies';
import { useRngStore } from '../useRngStore';
import { STATUS_CARDS } from '../../assets/data/cards';
import { calculateDamageToEnemy, calculateDamageToPlayer } from '../../logic/damageCalculation';
import { onEnemyKilledBySpecial, onFatalDamage } from '../../logic/relicEffects';
import { processStatusDamage, parseAttackIntent, processStatusDecay } from '../../logic/enemyTurnLogic';

export const createEnemySlice: StateCreator<BattleState, [], [], EnemySlice> = (set, get) => ({
  enemies: [],
  activeEnemyIndex: null,

  spawnEnemies: (enemyArray) => set({ enemies: enemyArray }),

  setActiveEnemyIndex: (index) => set({ activeEnemyIndex: index }),

  applyStatusToEnemy: (enemyId, status, amount) => {
    set((state) => ({
      enemies: state.enemies.map(enemy => {
        if (enemy.id !== enemyId) return enemy;
        const currentStatuses = enemy.statuses || {};
        return {
          ...enemy,
          statuses: {
            ...currentStatuses,
            [status]: (currentStatuses[status] || 0) + amount
          }
        };
      })
    }));
  },

  applyDamageToEnemy: (enemyId, amount, type) => {
    set((state) => {
      const newEnemies = state.enemies.map(enemy => {
        if (enemy.id !== enemyId) return enemy;

        const result = calculateDamageToEnemy(enemy, amount, type);

        if (result.actualDamage > 0) {
          useRunStore.getState().addDamageDealt(result.actualDamage);
          const dmgColor = type === 'PHYSICAL' ? 0xff4444 : 0xaa44ff;
          get().pushDamageNumber(enemyId, result.actualDamage, dmgColor);
        }

        if (result.isKilled && type === 'SPECIAL') {
          const healAmount = onEnemyKilledBySpecial(useRunStore.getState().relics);
          if (healAmount > 0) useRunStore.getState().healPlayer(healAmount);
        }

        if (result.isKilled) {
          const mark = state.playerStatus.markOfFate;
          if (mark && mark.enemyId === enemyId) {
            useRunStore.getState().healPlayer(mark.healAmount);
            get().addAmmo(mark.ammoAmount);
            useRunStore.getState().setToastMessage(`약육강식 발동 -- 체력 ${mark.healAmount} 회복, 탄약 ${mark.ammoAmount} 획득!`);
          }
        }

        return {
          ...enemy,
          shield: result.newShield,
          resist: result.newResist,
          currentHp: result.finalHp,
          visualEffect: { type: 'DAMAGE' as const, tick: Date.now() }
        };
      });

      const isVictory = newEnemies.every(e => e.currentHp <= 0);

      if (isVictory) {
        useRunStore.getState().addEnemiesKilled(newEnemies.length);

        const isBossDefeated = newEnemies.some(e => e.tier === 'BOSS');

        if (isBossDefeated) {
          const runStore = useRunStore.getState();
          const startTime = runStore.runStartTime || Date.now();
          const playTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
          const hpScore = runStore.playerHp * 10;
          const timePenalty = Math.max(0, playTimeSeconds - 300);
          let finalScore = 1000 + hpScore - timePenalty;
          if (finalScore < 0) finalScore = 0;

          Promise.all([
            import('../useMapStore'),
            import('../../api/auth')
          ]).then(([{ useMapStore }, { authApi }]) => {
            const submitData = {
              score: finalScore,
              clearLayer: useMapStore.getState().currentFloor,
              playTimeSeconds
            };
            authApi.post('/leaderboard', submitData).catch(err => {
              console.error("리더보드 점수 등록 실패", err);
            });
          });
        }

        return { enemies: newEnemies, battleResult: 'VICTORY' as const };
      }

      return { enemies: newEnemies };
    });
  },

  executeOneEnemyTurn: (enemyIndex) => {
    set((state) => {
      const reflectPhysical = state.playerStatus.reflectPhysical;
      const ammoOnSpecialDefend = state.playerStatus.ammoOnSpecialDefend;
      let bonusApNextTurn = state.bonusApNextTurn;
      let ammoGained = 0;

      const enemy = state.enemies[enemyIndex];
      if (!enemy || enemy.currentHp <= 0) return {};

      const currentStatuses = { ...(enemy.statuses || {}) };

      // 1. 상태이상 데미지 처리
      const statusResult = processStatusDamage(enemy);

      // 상태이상 데미지 넘버
      const statusDamage = enemy.currentHp - statusResult.newHp;
      if (statusDamage > 0) {
        const statusColor = statusResult.vfx?.type === 'POISON_TICK' ? 0x22ff44
          : statusResult.vfx?.type === 'BURN_TICK' ? 0xff6600 : 0xff6600;
        get().pushDamageNumber(enemy.id, statusDamage, statusColor);
      }

      if (statusResult.isDead) {
        const newEnemies = [...state.enemies];
        newEnemies[enemyIndex] = { ...enemy, currentHp: 0, statuses: {}, currentIntent: null, visualEffect: statusResult.vfx };

        const mark = state.playerStatus.markOfFate;
        if (mark && mark.enemyId === enemy.id) {
          useRunStore.getState().healPlayer(mark.healAmount);
          ammoGained += mark.ammoAmount;
          useRunStore.getState().setToastMessage(`약육강식 발동 -- 체력 ${mark.healAmount} 회복, 탄약 ${mark.ammoAmount} 획득!`);
        }

        return {
          enemies: newEnemies,
          playerAmmo: state.playerAmmo + ammoGained,
          playerStatus: { ...state.playerStatus },
        };
      }

      let enemyObj = { ...enemy, currentHp: statusResult.newHp, visualEffect: statusResult.vfx };
      let hitQueue: Array<{ type: 'DAMAGE' | 'BURN' | 'POISON' }> = [];
      let newShield = state.playerStatus.shield;
      let newResist = state.playerStatus.resist;

      // 2. 행동 처리
      if (enemyObj.currentIntent) {
        if (enemyObj.currentIntent.type === 'ATTACK' && enemyObj.currentIntent.amount) {
          const isSpecial = enemyObj.currentIntent.damageType === 'SPECIAL';

          const { rawDamage, hitCount } = parseAttackIntent(
            enemyObj.currentIntent.amount,
            enemyObj.currentIntent.description,
            currentStatuses.WEAK || 0,
            state.playerDebuffs.VULNERABLE || 0
          );

          const dmgResult = calculateDamageToPlayer(
            rawDamage, hitCount, isSpecial,
            { shield: newShield, resist: newResist },
            enemyObj.currentIntent.description
          );

          newShield = dmgResult.newShield;
          newResist = dmgResult.newResist;
          hitQueue = dmgResult.hitQueue;

          if (!isSpecial && reflectPhysical > 0 && dmgResult.totalDamage > 0) {
            enemyObj = {
              ...enemyObj,
              currentHp: Math.max(0, enemyObj.currentHp - reflectPhysical),
            };
            useRunStore.getState().addDamageDealt(Math.min(reflectPhysical, enemyObj.currentHp + reflectPhysical));
          }

          if (isSpecial && dmgResult.specialDefended && ammoOnSpecialDefend > 0) {
            ammoGained += ammoOnSpecialDefend;
          }

          if (isSpecial && dmgResult.specialDefended && state.playerStatus.apOnSpecialDefend > 0) {
            bonusApNextTurn += state.playerStatus.apOnSpecialDefend;
          }

          if (dmgResult.totalDamage > 0) {
            useRunStore.getState().damagePlayer(dmgResult.totalDamage);
            useRunStore.getState().addDamageTaken(dmgResult.totalDamage);

            if (useRunStore.getState().playerHp <= 0) {
              const fatalResult = onFatalDamage(useRunStore.getState().relics);
              if (fatalResult.shouldRevive) {
                const maxHp = useRunStore.getState().playerMaxHp;
                const reviveHp = Math.ceil(maxHp * fatalResult.reviveHpPercent);
                useRunStore.getState().healPlayer(reviveHp);
                if (fatalResult.relicToRemove) useRunStore.getState().removeRelic(fatalResult.relicToRemove);
                useRunStore.getState().setToastMessage(`빛바랜 가족사진 발동! 체력 ${reviveHp}로 부활!`);
              }
            }

            if (enemyObj.currentIntent!.description.includes('소이탄')) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...burnBlueprint } = STATUS_CARDS[0];
              useDeckStore.getState().addCardToDiscardPile(burnBlueprint);
              useRunStore.getState().setToastMessage('오염물질 침투 — 덱에 [화상] 카드가 섞여들었다!');
            }

            if (enemyObj.currentIntent!.applyDebuff) {
              const { status, amount } = enemyObj.currentIntent!.applyDebuff;
              const currentDebuffs = get().playerDebuffs;
              set({ playerDebuffs: { ...currentDebuffs, [status]: (currentDebuffs[status] || 0) + amount } });
              useRunStore.getState().setToastMessage(`${enemyObj.name}의 공격! ${status} ${amount}턴 부여!`);
            }
          }
        } else if (enemyObj.currentIntent.type === 'BUFF' && enemyObj.currentIntent.amount) {
          enemyObj = {
            ...enemyObj,
            shield: enemyObj.shield + enemyObj.currentIntent.amount,
            visualEffect: { type: 'BUFF' as const, tick: Date.now() }
          };
        }
      }

      // 3. 상태이상 감소 및 다음 의도
      const updatedEnemy = {
        ...enemyObj,
        statuses: processStatusDecay(currentStatuses),
        currentIntent: determineNextIntent(enemyObj.baseId, useRngStore.getState().intentRng),
        visualEffect: (enemyObj.visualEffect?.type && enemyObj.visualEffect.type !== 'DAMAGE')
          ? enemyObj.visualEffect : undefined
      };

      const newEnemies = [...state.enemies];
      newEnemies[enemyIndex] = updatedEnemy;

      const isDefeat = useRunStore.getState().playerHp <= 0;

      return {
        enemies: newEnemies,
        playerAmmo: state.playerAmmo + ammoGained,
        playerStatus: { ...state.playerStatus, shield: newShield, resist: newResist },
        battleResult: isDefeat ? 'DEFEAT' as const : state.battleResult,
        playerHitQueue: [...state.playerHitQueue, ...hitQueue],
        bonusApNextTurn,
      };
    });
  },
});
