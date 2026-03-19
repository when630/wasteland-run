import type { StateCreator } from 'zustand';
import type { BattleState, EnemySlice } from './types';
import { useRunStore } from '../useRunStore';
import { useDeckStore } from '../useDeckStore';
import { determineNextIntent } from '../../assets/data/enemies';
import { useRngStore } from '../useRngStore';
import { STATUS_CARDS } from '../../assets/data/cards';
import { calculateDamageToEnemy, calculateDamageToPlayer } from '../../logic/damageCalculation';
import { onEnemyKilledBySpecial, onEnemyKilledByPhysical, onEnemyKilled, onFatalDamage } from '../../logic/relicEffects';
import { processStatusDamage, parseAttackIntent, processStatusDecay } from '../../logic/enemyTurnLogic';
import { dispatchVfx } from '../../components/pixi/vfx/vfxDispatcher';
import { PLAYER_POS, enemyPos } from '../../components/pixi/vfx/battleLayout';

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

        if (result.isKilled) {
          const relics = useRunStore.getState().relics;

          // 특수 공격 킬: 체력 회복
          if (type === 'SPECIAL') {
            const healAmount = onEnemyKilledBySpecial(relics);
            if (healAmount > 0) useRunStore.getState().healPlayer(healAmount);
          }

          // 물리 공격 킬: 스플래시 데미지
          if (type === 'PHYSICAL') {
            const physKillFx = onEnemyKilledByPhysical(relics);
            if (physKillFx.splashDamage > 0) {
              setTimeout(() => {
                const allEnemies = get().enemies;
                allEnemies.forEach(e => {
                  if (e.currentHp > 0 && e.id !== enemyId) {
                    get().applyDamageToEnemy(e.id, physKillFx.splashDamage, 'PHYSICAL');
                  }
                });
              }, 50);
            }
          }

          // 킬 공통: 탄약 획득
          const killFx = onEnemyKilled(relics);
          if (killFx.ammo > 0) get().addAmmo(killFx.ammo);
        }

        if (result.isKilled) {
          const mark = state.playerStatus.markOfFate;
          if (mark && mark.enemyId === enemyId) {
            if (mark.drawAmount && mark.drawAmount > 0) {
              // 약탈: 드로우 + 탄약
              useDeckStore.getState().drawCards(mark.drawAmount);
              get().addAmmo(mark.ammoAmount);
              useRunStore.getState().setToastMessage(`약탈 발동 -- 카드 ${mark.drawAmount}장 드로우, 탄약 ${mark.ammoAmount} 획득!`);
            } else {
              // 약육강식: 체력 회복 + 탄약
              useRunStore.getState().healPlayer(mark.healAmount);
              get().addAmmo(mark.ammoAmount);
              useRunStore.getState().setToastMessage(`약육강식 발동 -- 체력 ${mark.healAmount} 회복, 탄약 ${mark.ammoAmount} 획득!`);
            }
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

      // 사망한 적 VFX 디스패치
      try {
        newEnemies.forEach((e, idx) => {
          const orig = state.enemies[idx];
          if (orig && orig.currentHp > 0 && e.currentHp <= 0) {
            const pos = enemyPos(idx, state.enemies.length);
            dispatchVfx({
              cardBaseId: '__enemy_death__',
              sourceX: pos.x,
              sourceY: pos.y,
              targetPositions: [{ x: pos.x, y: pos.y }],
            });
          }
        });
      } catch { /* VFX는 게임 로직에 영향 없음 */ }

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
            import('../../api/platform')
          ]).then(([{ useMapStore }, { platformSubmitLeaderboard }]) => {
            const submitData = {
              score: finalScore,
              clearLayer: useMapStore.getState().currentFloor,
              playTimeSeconds
            };
            platformSubmitLeaderboard(submitData).catch(err => {
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

      // 상태이상 데미지 넘버 + VFX
      const statusDamage = enemy.currentHp - statusResult.newHp;
      if (statusDamage > 0) {
        const statusColor = statusResult.vfx?.type === 'POISON_TICK' ? 0x22ff44
          : statusResult.vfx?.type === 'BURN_TICK' ? 0xff6600 : 0xff6600;
        get().pushDamageNumber(enemy.id, statusDamage, statusColor);

        // 상태이상 틱 VFX 디스패치
        try {
          const pos = enemyPos(enemyIndex, state.enemies.length);
          const vfxKey = statusResult.vfx?.type === 'POISON_TICK' ? '__enemy_poison_tick__' : '__enemy_burn_tick__';
          dispatchVfx({
            cardBaseId: vfxKey,
            sourceX: pos.x,
            sourceY: pos.y,
            targetPositions: [{ x: pos.x, y: pos.y }],
          });
        } catch { /* VFX는 게임 로직에 영향 없음 */ }
      }

      if (statusResult.isDead) {
        // 상태이상 사망 VFX
        try {
          const pos = enemyPos(enemyIndex, state.enemies.length);
          dispatchVfx({
            cardBaseId: '__enemy_death__',
            sourceX: pos.x,
            sourceY: pos.y,
            targetPositions: [{ x: pos.x, y: pos.y }],
          });
        } catch { /* VFX는 게임 로직에 영향 없음 */ }

        const newEnemies = [...state.enemies];
        newEnemies[enemyIndex] = { ...enemy, currentHp: 0, statuses: {}, currentIntent: null, visualEffect: statusResult.vfx };

        const mark = state.playerStatus.markOfFate;
        if (mark && mark.enemyId === enemy.id) {
          if (mark.drawAmount && mark.drawAmount > 0) {
            useDeckStore.getState().drawCards(mark.drawAmount);
            ammoGained += mark.ammoAmount;
            useRunStore.getState().setToastMessage(`약탈 발동 -- 카드 ${mark.drawAmount}장 드로우, 탄약 ${mark.ammoAmount} 획득!`);
          } else {
            useRunStore.getState().healPlayer(mark.healAmount);
            ammoGained += mark.ammoAmount;
            useRunStore.getState().setToastMessage(`약육강식 발동 -- 체력 ${mark.healAmount} 회복, 탄약 ${mark.ammoAmount} 획득!`);
          }
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
          const intent = enemyObj.currentIntent;
          // 공격 스프라이트 전환용
          enemyObj = { ...enemyObj, visualEffect: { type: 'ATTACKING' as const, tick: Date.now() } };
          const isSpecial = intent.damageType === 'SPECIAL';

          const { rawDamage, hitCount } = parseAttackIntent(
            intent.amount!,
            intent.description,
            currentStatuses.WEAK || 0,
            state.playerDebuffs.VULNERABLE || 0
          );

          const dmgResult = calculateDamageToPlayer(
            rawDamage, hitCount, isSpecial,
            { shield: newShield, resist: newResist },
            intent.description
          );

          newShield = dmgResult.newShield;
          newResist = dmgResult.newResist;
          hitQueue = dmgResult.hitQueue;

          // 적 공격 VFX 디스패치 (다단히트 시 히트 수만큼 분산)
          try {
            const atkVfxType = isSpecial ? 'RANGED' : 'MELEE';
            const srcPos = enemyPos(enemyIndex, state.enemies.length);
            for (let h = 0; h < hitCount; h++) {
              if (h === 0) {
                dispatchVfx({
                  cardBaseId: `__enemy_${atkVfxType.toLowerCase()}__`,
                  sourceX: srcPos.x,
                  sourceY: srcPos.y,
                  targetPositions: [{ x: PLAYER_POS.x, y: PLAYER_POS.y }],
                  hitIndex: h,
                });
              } else {
                setTimeout(() => {
                  dispatchVfx({
                    cardBaseId: `__enemy_${atkVfxType.toLowerCase()}__`,
                    sourceX: srcPos.x,
                    sourceY: srcPos.y,
                    targetPositions: [{ x: PLAYER_POS.x, y: PLAYER_POS.y }],
                    hitIndex: h,
                  });
                }, h * 150);
              }
            }
          } catch { /* VFX는 게임 로직에 영향 없음 */ }

          if (!isSpecial && reflectPhysical > 0 && dmgResult.totalDamage > 0) {
            const reflectDmg = Math.min(reflectPhysical, enemyObj.currentHp);
            enemyObj = {
              ...enemyObj,
              currentHp: Math.max(0, enemyObj.currentHp - reflectPhysical),
            };
            useRunStore.getState().addDamageDealt(Math.min(reflectPhysical, enemyObj.currentHp + reflectPhysical));

            // 반사 데미지 VFX 디스패치
            try {
              const ePos = enemyPos(enemyIndex, state.enemies.length);
              dispatchVfx({
                cardBaseId: '__enemy_reflect__',
                sourceX: PLAYER_POS.x,
                sourceY: PLAYER_POS.y,
                targetPositions: [{ x: ePos.x, y: ePos.y }],
              });
              if (reflectDmg > 0) {
                get().pushDamageNumber(enemy.id, reflectDmg, 0xff8844);
              }
            } catch { /* VFX는 게임 로직에 영향 없음 */ }
          }

          // 분노 파워: 물리 피격 시 방어도 획득
          if (!isSpecial && dmgResult.totalDamage > 0 && state.powerRageAmount > 0) {
            newShield += state.powerRageAmount;
          }

          if (isSpecial && dmgResult.specialDefended && ammoOnSpecialDefend > 0) {
            ammoGained += ammoOnSpecialDefend;
          }

          if (isSpecial && dmgResult.specialDefended && state.playerStatus.apOnSpecialDefend > 0) {
            bonusApNextTurn += state.playerStatus.apOnSpecialDefend;
          }

          // 보급품 피해 감소 적용
          let finalPlayerDmg = dmgResult.totalDamage;
          if (finalPlayerDmg > 0 && state.supplyDmgReductionFlat > 0) {
            finalPlayerDmg = Math.max(0, finalPlayerDmg - state.supplyDmgReductionFlat);
          }
          if (finalPlayerDmg > 0 && state.supplyDmgReductionPercent > 0 && state.supplyDmgReductionPercentTurns > 0) {
            finalPlayerDmg = Math.floor(finalPlayerDmg * (1 - state.supplyDmgReductionPercent / 100));
          }

          if (finalPlayerDmg > 0) {
            useRunStore.getState().damagePlayer(finalPlayerDmg);
            useRunStore.getState().addDamageTaken(finalPlayerDmg);

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

            if (intent.description.includes('소이탄')) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...burnBlueprint } = STATUS_CARDS[0];
              useDeckStore.getState().addCardToDiscardPile(burnBlueprint);
              useRunStore.getState().setToastMessage('오염물질 침투 — 덱에 [화상] 카드가 섞여들었다!');
            }

            if (intent.applyDebuff) {
              const { status, amount } = intent.applyDebuff;
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

          // 적 버프 VFX 디스패치
          try {
            const buffPos = enemyPos(enemyIndex, state.enemies.length);
            dispatchVfx({
              cardBaseId: '__enemy_buff__',
              sourceX: buffPos.x,
              sourceY: buffPos.y,
              targetPositions: [{ x: buffPos.x, y: buffPos.y }],
            });
          } catch { /* VFX는 게임 로직에 영향 없음 */ }
        }
      }

      // 3. 상태이상 감소 및 다음 의도
      const intentRng = useRngStore.getState().intentRng;
      const mutStage = useRunStore.getState().mutationStage;
      const newIntent = determineNextIntent(enemyObj.baseId, intentRng, mutStage);
      // 예언의 수정구: 다음 턴 의도도 미리 계산
      const hasOrb = useRunStore.getState().relics.includes('prophecy_orb');
      const peekIntent = hasOrb ? determineNextIntent(enemyObj.baseId, intentRng, mutStage) : null;

      const updatedEnemy = {
        ...enemyObj,
        statuses: processStatusDecay(currentStatuses),
        currentIntent: newIntent,
        nextIntent: peekIntent,
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
