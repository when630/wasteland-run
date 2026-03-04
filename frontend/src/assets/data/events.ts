import type { RandomEvent } from '../../types/eventTypes';
import { useRunStore } from '../../store/useRunStore';
import { useDeckStore } from '../../store/useDeckStore';
import { RELICS } from './relics';
import { STARTING_CARDS } from './cards';
import { generateUniqueId, customShuffle } from '../../utils/rng';

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'evt_radiation_pool',
    title: '방사능 웅덩이 속의 반짝임',
    description: '황량한 도로 한가운데, 기분 나쁜 형광 녹색 빛을 뿜어내는 웅덩이가 있습니다. 그 안에서 온전해 보이는 보급 상자가 반짝입니다. 부식성 액체에 손을 넣어야만 꺼낼 수 있을 것 같습니다.',
    visualDesc: '보글보글 끓어오르는 네온 그린(Neon Green) 색상의 웅덩이...',
    options: [
      {
        label: '[손을 집어넣는다]',
        description: '체력을 10 잃습니다. 무작위 [희귀] 유물을 하나 얻습니다.',
        onSelect: () => {
          const runStore = useRunStore.getState();
          runStore.damagePlayer(10);

          // 희귀 유물 중 미보유 추출
          const rareRelics = RELICS.filter(r => r.tier === 'RARE' && !runStore.relics.includes(r.id));
          if (rareRelics.length > 0) {
            const pick = rareRelics[Math.floor(Math.random() * rareRelics.length)];
            runStore.addRelic(pick.id);
            return `살갗이 타들어가는 고통을 참아내며 상자를 건졌습니다! 당신은 체력을 10 잃었지만 [${pick.name}] 유물을 손에 넣었습니다.`;
          } else {
            return `살갗이 타들어가는 고통을 참아냈지만... 상자는 이미 텅 비어 있었습니다! (체력 10 감소)`;
          }
        },
      },
      {
        label: '[막대기로 긁어모은다]',
        description: '체력 피해가 없습니다. 무작위 [특수 공격] 카드 1장을 얻습니다.',
        onSelect: () => {
          const deckStore = useDeckStore.getState();
          // STARTING_CARDS 중 특수 공격 카드를 예시로 하나 준다고 가정
          const specialAttacks = STARTING_CARDS.filter(c => c.type === 'SPECIAL_ATTACK');
          const pick = specialAttacks[Math.floor(Math.random() * specialAttacks.length)];
          deckStore.addCardToMasterDeck({ ...pick } as any);
          return `주변의 긴 막대기로 간신히 끄트머리에 걸려있던 물건 하나를 건졌습니다. [${pick.name}] 카드를 얻었습니다.`;
        },
      },
      {
        label: '[무시하고 지나간다]',
        description: '아무 일도 일어나지 않습니다.',
        onSelect: () => {
          return `당신은 목숨을 걸 가치가 없다고 판단하고 웅덩이를 지나쳤습니다.`;
        },
      }
    ]
  },
  {
    id: 'evt_mechanic_fire',
    title: '떠돌이 기계공의 모닥불',
    description: '고철을 주렁주렁 매단 기계공이 모닥불 곁에서 당신을 부릅니다. "가진 장비 중에 영 쓸모없는 게 있다면, 내가 아주 \'특별하게\' 개조해 주지. 물론 공짜는 아니야."',
    visualDesc: '붉은 모닥불의 따뜻한 조명과 대비되는 차갑고 기괴한 기계팔을 단 NPC...',
    options: [
      {
        label: '[개조 의뢰]',
        description: '골드 50을 지불합니다. 덱에서 카드 1장을 영구히 **제거**합니다.',
        condition: () => useRunStore.getState().gold >= 50 && useDeckStore.getState().masterDeck.length > 0,
        onSelect: () => {
          const runStore = useRunStore.getState();
          runStore.addGold(-50);
          // 카드 제거 처리를 위한 특수 플래그 (EventView에서 감지해서 모달 띄움)
          return `TRIGGER_CARD_REMOVE`;
        }
      },
      {
        label: '[도박성 융합]',
        description: '덱의 카드 1장을 무작위로 제거합니다. 무작위 [변화] 카드를 1장 얻습니다.',
        condition: () => useDeckStore.getState().masterDeck.length > 0,
        onSelect: () => {
          const deckStore = useDeckStore.getState();
          const masterDeck = [...deckStore.masterDeck];
          // 무작위로 1장 희생
          const removeIdx = Math.floor(Math.random() * masterDeck.length);
          const removedCard = masterDeck[removeIdx];
          masterDeck.splice(removeIdx, 1);

          // 변화 카드 지급
          const utilities = STARTING_CARDS.filter(c => c.type === 'UTILITY');
          const pick = utilities[Math.floor(Math.random() * utilities.length)];

          deckStore.setMasterDeck(masterDeck);
          deckStore.addCardToMasterDeck({ ...pick } as any);

          return `기계공이 당신의 가방에서 멋대로 [${removedCard.name}] 카드를 가져가 분해해버렸습니다! 그리고 낄낄대며 엉뚱한 물건([${pick.name}])을 던져줍니다.`;
        }
      },
      {
        label: '[공격한다]',
        description: '위험한 기계공과 전투를 시작합니다.',
        onSelect: () => {
          // 엘리트 전투 씬으로 이동 
          return `TRIGGER_ELITE_BATTLE`;
        }
      }
    ]
  },
  {
    id: 'evt_abandoned_truck',
    title: '버려진 군용 트럭',
    description: '도로 외곽에 엎어져 있는 군용 수송 트럭을 발견했습니다. 짐칸 문은 굳게 잠겨 있고, 문고리에는 정교한 폭약 함정이 설치되어 있습니다.',
    visualDesc: '국방색 도색이 벗겨진 거대한 트럭. 자물쇠에 빨간색 LED 불빛이 깜빡입니다.',
    options: [
      {
        label: '[함정 해체 시도]',
        description: '50% 확률로 최대 체력이 5 증가합니다. 50% 확률로 실패하여 체력을 15 잃습니다.',
        onSelect: () => {
          const isSuccess = Math.random() > 0.5;
          const runStore = useRunStore.getState();
          if (isSuccess) {
            useRunStore.setState({ playerMaxHp: runStore.playerMaxHp + 5 });
            runStore.healPlayer(5);
            return `해체 성공! 깔끔하게 처리한 함정 덕분에 약간의 안도감을 얻습니다. (최대 체력이 5 상승했습니다)`;
          } else {
            runStore.damagePlayer(15);
            return `퍼펑! 선을 잘못 건드렸습니다. 폭발로 인해 큰 상처를 입었습니다. (체력 15 감소)`;
          }
        }
      },
      {
        label: '[트럭 바퀴만 빼간다]',
        description: '안전하게 이탈하여 골드를 30 획득합니다.',
        onSelect: () => {
          useRunStore.getState().addGold(30);
          return `위험한 함정을 건드리기보다는 바퀴의 휠이나 타이어를 분해해 고철 상인에게 팔기로 했습니다. (골드 30 획득)`;
        }
      },
      {
        label: '[총알로 자물쇠를 부순다]',
        description: '덱의 무작위 [특수 공격] 카드를 1장 영구히 잃습니다. 대신 무작위 [보스] 유물을 발견합니다.',
        condition: () => {
          // 덱에 특수 공격 카드가 하나라도 있어야 함
          return useDeckStore.getState().masterDeck.some(c => c.type === 'SPECIAL_ATTACK');
        },
        onSelect: () => {
          const runStore = useRunStore.getState();
          const deckStore = useDeckStore.getState();

          let masterDeck = [...deckStore.masterDeck];
          const specialIndex = masterDeck.findIndex(c => c.type === 'SPECIAL_ATTACK');
          const removedName = masterDeck[specialIndex].name;
          masterDeck.splice(specialIndex, 1);
          deckStore.setMasterDeck(masterDeck);

          const bossRelics = RELICS.filter(r => r.tier === 'BOSS' && !runStore.relics.includes(r.id));
          if (bossRelics.length > 0) {
            const pick = bossRelics[Math.floor(Math.random() * bossRelics.length)];
            runStore.addRelic(pick.id);
            return `거리를 두고 총을 쏴 함정을 부쉈습니다. 총은 산산조각 났지만([${removedName}] 잃음), 안에서 놀랍게도 [${pick.name}] 유물을 찾아냈습니다!`;
          } else {
            return `총을 쏴서 함정을 부쉈지만, 가방 속엔 쓰레기밖에 없었습니다.`;
          }
        }
      }
    ]
  },
  {
    id: 'evt_arcade_machine',
    title: '작동하는 아케이드 게임기',
    description: '폐허가 된 건물 구석에서 기적적으로 전력이 들어와 있는 낡은 오락기를 발견했습니다. 화면에서는 조악한 픽셀 보이가 춤을 추고 있습니다.',
    visualDesc: '칙칙한 주변 환경과 대비되는 8비트 레트로 색감의 오락기 화면이 번쩍거립니다.',
    options: [
      {
        label: '[동전을 넣고 플레이한다]',
        description: '체력 5를 잃고 쏟아지는 피로를 느낍니다. 하지만 덱의 카드 2장을 무작위로 강화(Upgrade)합니다.',
        condition: () => useRunStore.getState().playerHp > 5 && useDeckStore.getState().masterDeck.length >= 2,
        onSelect: () => {
          const runStore = useRunStore.getState();
          const deckStore = useDeckStore.getState();

          runStore.damagePlayer(5);

          // 강화되지 않은 카드 목록 추출 후 2장 랜덤 픽
          const unupgraded = deckStore.masterDeck.filter(c => !c.isUpgraded);
          if (unupgraded.length > 0) {
            const shuffled = customShuffle(unupgraded);
            const targets = shuffled.slice(0, Math.min(2, shuffled.length));

            targets.forEach(t => {
              deckStore.upgradeCard(t.id);
            });

            const upNames = targets.map(t => `[${t.name}]`).join(', ');
            return `시간 가는 줄 모르고 오락을 즐긴 끝에 눈이 침침해졌습니다(체력 5 감소). 하지만 짜릿한 고득점의 기운이 ${upNames} 카드를 강화시켰습니다!`;
          } else {
            return `당신의 카드는 이미 한계까지 단련되어 게임의 영감을 받아들일 자리가 없습니다... 시간만 낭비했습니다 (체력 5 감소).`;
          }
        }
      },
      {
        label: '[오락기를 부숴버린다]',
        description: '[물리 방어] 관련 카드 1장을 뜯어냅니다.',
        onSelect: () => {
          const deckStore = useDeckStore.getState();
          const defenses = STARTING_CARDS.filter(c => c.type === 'PHYSICAL_DEFENSE');
          const pick = defenses[Math.floor(Math.random() * defenses.length)];
          deckStore.addCardToMasterDeck({ ...pick } as any);

          return `오락기를 후려쳐서 쓸만한 판넬 부품을 떼어냈습니다. [${pick.name}] 카드를 얻었습니다.`;
        }
      }
    ]
  }
];
