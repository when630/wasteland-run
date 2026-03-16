import type { RandomEvent } from '../../types/eventTypes';
import { useRunStore } from '../../store/useRunStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useRngStore } from '../../store/useRngStore';
import { RELICS } from './relics';
import { ALL_CARDS, STARTING_CARDS, STATUS_CARDS } from './cards';
import { customShuffle } from '../../utils/rng';

/**
 * 0층 출발 이벤트 — 게임 시작 시 3가지 축복 중 하나를 선택
 */
export const STARTING_EVENTS: RandomEvent[] = [
  {
    id: 'evt_starting_wasteland_gate',
    title: '황무지의 관문',
    description: '폐허가 된 도시의 경계에 섰습니다. 이곳에서부터 당신의 여정이 시작됩니다. 무너진 검문소 앞에 세 갈래 길이 보입니다. 각각의 길 앞에는 이전 탐험가들이 남긴 흔적이 있습니다.',
    visualDesc: '녹슨 철조망과 콘크리트 잔해 사이로 세 갈래의 길이 뻗어 있습니다. 저 멀리 황무지의 먼지 폭풍이 일렁입니다...',
    options: [
      {
        label: '[보급품 창고를 뒤진다]',
        description: '골드 100을 획득합니다.',
        onSelect: () => {
          useRunStore.getState().addGold(100);
          return '검문소 옆 보급품 창고에서 쓸만한 물자를 잔뜩 챙겼습니다. (골드 100 획득)';
        }
      },
      {
        label: '[의료 텐트에서 체력을 보강한다]',
        description: '최대 체력이 15 증가하고 체력이 완전히 회복됩니다.',
        onSelect: () => {
          const runStore = useRunStore.getState();
          useRunStore.setState({ playerMaxHp: runStore.playerMaxHp + 15 });
          runStore.healPlayer(999);
          return '남겨진 의료 장비로 몸 상태를 최상으로 끌어올렸습니다. (최대 체력 +15, 체력 완전 회복)';
        }
      },
      {
        label: '[수상한 사물함을 연다]',
        description: '무작위 [일반] 유물을 1개 획득합니다.',
        onSelect: () => {
          const runStore = useRunStore.getState();
          const commonRelics = RELICS.filter(r => r.tier === 'COMMON' && !runStore.relics.includes(r.id));
          if (commonRelics.length > 0) {
            const pick = commonRelics[Math.floor(useRngStore.getState().eventRng.next() * commonRelics.length)];
            runStore.addRelic(pick.id);
            return `사물함 안에서 이전 탐험가의 유품을 발견했습니다. [${pick.name}] 유물을 획득했습니다!`;
          } else {
            runStore.addGold(50);
            return '사물함은 이미 털린 뒤였지만, 바닥에 흩어진 동전을 주웠습니다. (골드 50 획득)';
          }
        }
      }
    ]
  }
];

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
            const pick = rareRelics[Math.floor(useRngStore.getState().eventRng.next() * rareRelics.length)];
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
          const pick = specialAttacks[Math.floor(useRngStore.getState().eventRng.next() * specialAttacks.length)];
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
          const removeIdx = Math.floor(useRngStore.getState().eventRng.next() * masterDeck.length);
          const removedCard = masterDeck[removeIdx];
          masterDeck.splice(removeIdx, 1);

          // 변화 카드 지급
          const utilities = STARTING_CARDS.filter(c => c.type === 'UTILITY');
          const pick = utilities[Math.floor(useRngStore.getState().eventRng.next() * utilities.length)];

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
          const isSuccess = useRngStore.getState().eventRng.next() > 0.5;
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
            const pick = bossRelics[Math.floor(useRngStore.getState().eventRng.next() * bossRelics.length)];
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
            const shuffled = customShuffle(unupgraded, useRngStore.getState().eventRng);
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
          const pick = defenses[Math.floor(useRngStore.getState().eventRng.next() * defenses.length)];
          deckStore.addCardToMasterDeck({ ...pick } as any);

          return `오락기를 후려쳐서 쓸만한 판넬 부품을 떼어냈습니다. [${pick.name}] 카드를 얻었습니다.`;
        }
      }
    ]
  },
  {
    id: 'evt_abandoned_clinic',
    title: '폐허가 된 진료소',
    description: '방사능 피폭을 치료하던 옛 진료소의 잔해입니다. 반쯤 부서진 자동 치료기기가 아직 전원을 유지하고 윙윙거리는 소리를 내고 있습니다.',
    visualDesc: '파란색 메디컬 마크가 훼손된 채 깜빡이는 소형 캡슐 장치기...',
    options: [
      {
        label: '[장치에 몸을 맡긴다]',
        description: '체력을 30 회복합니다. 단, 부작용으로 덱에 [화상] 카드가 1장 추가됩니다.',
        onSelect: () => {
          useRunStore.getState().healPlayer(30);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...burnBlueprint } = STATUS_CARDS[0]; // BURN 카드
          useDeckStore.getState().addCardToMasterDeck(burnBlueprint as any);

          return `기계 팔이 상처를 거칠게 꿰매고 투박한 주사기를 꽂자, 찢어질 듯한 고통과 함께 엄청난 상쾌함이 밀려옵니다. (체력 30 회복, 덱에 [화상] 추가됨)`;
        }
      },
      {
        label: '[진열장을 뒤진다]',
        description: '무작위 [유틸리티] 카드를 1장 획득합니다.',
        onSelect: () => {
          const deckStore = useDeckStore.getState();
          const utilities = STARTING_CARDS.filter(c => c.type === 'UTILITY');
          const pick = utilities[Math.floor(useRngStore.getState().eventRng.next() * utilities.length)];
          deckStore.addCardToMasterDeck({ ...pick } as any);
          return `깨진 유리병들 사이에서 쓸만한 의학/화학 서적과 주사기를 챙겼습니다. [${pick.name}] 카드를 얻었습니다.`;
        }
      },
      {
        label: '[무시하고 떠난다]',
        description: '이 꺼림칙한 기계를 믿지 않고 발길을 돌립니다.',
        onSelect: () => {
          return `언제 오작동할지 모르는 기계에 목숨을 맡길 수는 없었습니다. 당신은 안전하게 진료소를 빠져나왔습니다.`;
        }
      }
    ]
  },
  {
    id: 'evt_scavenger_corpse',
    title: '고철 수집상의 시체',
    description: '단단히 무장한 어느 수집상의 시체가 길가에 놓여있습니다. 어떤 이유인지 파리 떼가 심하게 꼬여있지만, 그의 배낭은 꽤 묵직해 보입니다.',
    visualDesc: '파리 떼와 악취가 진동하는 가죽 배낭 멘 시체...',
    options: [
      {
        label: '[배낭을 통째로 턴다]',
        description: '골드 50을 획득합니다. 무작위 유물을 1개 획득합니다. 하지만 시체의 독기로 체력 10을 잃습니다.',
        onSelect: () => {
          const runStore = useRunStore.getState();
          runStore.addGold(50);
          runStore.damagePlayer(10);

          const normalRelics = RELICS.filter(r => r.tier !== 'BOSS' && !runStore.relics.includes(r.id));
          if (normalRelics.length > 0) {
            const pick = normalRelics[Math.floor(useRngStore.getState().eventRng.next() * normalRelics.length)];
            runStore.addRelic(pick.id);
            return `시체를 뒤집자 지독한 가스가 뿜어져 나와 얼굴을 덮쳤습니다! (체력 10 감소) 구역질을 참으며 배낭을 뒤져 50 골드와 [${pick.name}] 유물을 찾아냈습니다.`;
          } else {
            return `시체를 뒤집자 지독한 가스가 뿜어져 나와 얼굴을 덮쳤습니다! (체력 10 감소) 구역질을 참으며 배낭을 뒤져 50 골드를 찾아냈습니다.`;
          }
        }
      },
      {
        label: '[조심스럽게 겉만 뒤져본다]',
        description: '피해 없이 20 골드만을 안전하게 챙깁니다.',
        onSelect: () => {
          useRunStore.getState().addGold(20);
          return `악취에 이끌려 너무 깊이 파고들지 않았습니다. 주머니에 흘러나와 있던 20 골드만 줍고 현장을 떠났습니다.`;
        }
      }
    ]
  },
  {
    id: 'evt_cyborg_wager',
    title: '기계 사이보그의 내기',
    description: '반파된 상태로도 움직이는 사이보그가 고장 난 시각 모듈로 당신을 응시하며 도박을 제안합니다. "인생은 룰렛이라지... 나와 피를 걸고 승부해보겠나...?"',
    visualDesc: '푸른색 홀로그램 룰렛이 허공에 빙글빙글 돌고 있는 사이보그 머리통...',
    options: [
      {
        label: '[동의한다 (체력 15 지불)]',
        description: '체력 15를 내어줍니다. 33% 확률로 (희귀 유물 / 골드 100 / 카드 1장 제거) 중 하나가 당첨됩니다.',
        condition: () => useRunStore.getState().playerHp > 15,
        onSelect: () => {
          const runStore = useRunStore.getState();
          runStore.damagePlayer(15);

          const rand = useRngStore.getState().eventRng.next();
          if (rand < 0.33) {
            // 희귀 유물
            const rareRelics = RELICS.filter(r => r.tier === 'RARE' && !runStore.relics.includes(r.id));
            if (rareRelics.length > 0) {
              const pick = rareRelics[Math.floor(useRngStore.getState().eventRng.next() * rareRelics.length)];
              runStore.addRelic(pick.id);
              return `"잭팟이다... 운이 좋군..." 사이보그의 입에서 무언가 떨어집니다. 체력을 잃었으나 [${pick.name}] 유물을 습득했습니다!`;
            } else {
              runStore.addGold(50);
              return `"어라... 상품이 떨어졌군... 대신 돈을 주지." 체력을 잃고 골드 50을 얻었습니다.`;
            }
          } else if (rand < 0.66) {
            // 골드 100
            runStore.addGold(100);
            return `"잭팟이다... 운이 좋군..." 기계가 동전을 토해냅니다. 체력을 잃었으나 골드 100을 획득했습니다!`;
          } else {
            // 카드 1장 제거
            return `TRIGGER_CARD_REMOVE`; // EventView에 정의해둔 그 메커니즘을 동일하게 재사용
          }
        }
      },
      {
        label: '[기계를 파괴한다]',
        description: '무작위 [물리 공격] 카드를 1장 얻습니다. 50% 확률로 엘리트 전투가 시작됩니다!',
        onSelect: () => {
          const deckStore = useDeckStore.getState();
          const physics = STARTING_CARDS.filter(c => c.type === 'PHYSICAL_ATTACK');
          const pick = physics[Math.floor(useRngStore.getState().eventRng.next() * physics.length)];
          deckStore.addCardToMasterDeck({ ...pick } as any);

          if (useRngStore.getState().eventRng.next() < 0.5) {
            return `TRIGGER_ELITE_BATTLE`;
          } else {
            return `사이보그를 박살 내고 쓸만한 무기 부품 모듈([${pick.name}])을 갈취했습니다. 기계는 반격을 시도했지만 안타깝게도 전원이 꺼졌습니다.`;
          }
        }
      },
      {
        label: '[무시한다]',
        description: '아무 일도 일어나지 않습니다.',
        onSelect: () => {
          return `"겁쟁이 녀석..." 사이보그의 쉰 목소리를 뒤로 한 채 발걸음을 재촉합니다.`;
        }
      }
    ]
  },
  {
    id: 'evt_wandering_merchant',
    title: '방랑 상인의 비밀 거래',
    description: '폐허 사이에서 보따리를 짊어진 떠돌이 상인이 손짓합니다. "좋은 물건 있소. 구경만 해도 괜찮으니 와보시오." 그의 눈빛은 어딘가 교활하지만, 보따리에서 빛나는 것들이 눈에 띕니다.',
    visualDesc: '패치워크 망토를 두른 상인의 보따리에서 이상한 금속 광택이 번쩍입니다...',
    options: [
      {
        label: '[희귀 카드를 구매한다]',
        description: '골드 75를 지불합니다. 무작위 [희귀] 카드를 1장 얻습니다.',
        condition: () => useRunStore.getState().gold >= 75,
        onSelect: () => {
          const runStore = useRunStore.getState();
          runStore.addGold(-75);
          const rareCards = ALL_CARDS.filter(c => c.tier === 'RARE' );
          const pick = rareCards[Math.floor(useRngStore.getState().eventRng.next() * rareCards.length)];
          useDeckStore.getState().addCardToMasterDeck({ ...pick } as any);
          return `상인이 만족스러운 미소와 함께 보따리에서 빛나는 카드를 꺼내줍니다. 골드 75를 지불하고 [${pick.name}] 카드를 획득했습니다!`;
        }
      },
      {
        label: '[카드를 교환한다]',
        description: '덱에서 카드 1장을 무작위로 제거하고, 무작위 [비범한] 카드 1장을 얻습니다.',
        condition: () => useDeckStore.getState().masterDeck.length > 5,
        onSelect: () => {
          const deckStore = useDeckStore.getState();
          const masterDeck = [...deckStore.masterDeck];
          const removeIdx = Math.floor(useRngStore.getState().eventRng.next() * masterDeck.length);
          const removedCard = masterDeck[removeIdx];
          masterDeck.splice(removeIdx, 1);

          const uncommonCards = ALL_CARDS.filter(c => c.tier === 'UNCOMMON' );
          const pick = uncommonCards[Math.floor(useRngStore.getState().eventRng.next() * uncommonCards.length)];

          deckStore.setMasterDeck(masterDeck);
          deckStore.addCardToMasterDeck({ ...pick } as any);

          return `"등가교환이라... 공정한 거래지." 상인이 당신의 [${removedCard.name}]을 가져가고 대신 [${pick.name}] 카드를 건네줍니다.`;
        }
      },
      {
        label: '[상인의 유물을 흥정한다]',
        description: '골드 40을 지불합니다. 무작위 [일반] 유물을 1개 얻습니다.',
        condition: () => useRunStore.getState().gold >= 40,
        onSelect: () => {
          const runStore = useRunStore.getState();
          runStore.addGold(-40);
          const commonRelics = RELICS.filter(r => r.tier === 'COMMON' && !runStore.relics.includes(r.id));
          if (commonRelics.length > 0) {
            const pick = commonRelics[Math.floor(useRngStore.getState().eventRng.next() * commonRelics.length)];
            runStore.addRelic(pick.id);
            return `흥정 끝에 적당한 가격에 합의했습니다. 골드 40을 지불하고 [${pick.name}] 유물을 획득했습니다!`;
          } else {
            runStore.addGold(40); // 환불
            return `"미안하오, 맞는 물건이 없구려..." 상인이 아쉬운 듯 고개를 젓습니다.`;
          }
        }
      }
    ]
  },
  {
    id: 'evt_contaminated_oasis',
    title: '오염된 오아시스',
    description: '황무지 한가운데에 물이 고인 웅덩이를 발견했습니다. 물은 투명하고 깨끗해 보이지만, 주변의 식물들이 기형적으로 자라 있어 방사능 오염이 의심됩니다. 목마름과 의심 사이에서 갈등합니다.',
    visualDesc: '맑은 물 웅덩이 주변에 비정상적으로 거대한 버섯과 뒤틀린 식물들이 자라있습니다...',
    options: [
      {
        label: '[물을 벌컥벌컥 마신다]',
        description: '체력을 25 회복합니다. 50% 확률로 덱에 [화상] 카드가 2장 추가됩니다.',
        onSelect: () => {
          useRunStore.getState().healPlayer(25);
          const isTainted = useRngStore.getState().eventRng.next() < 0.5;
          if (isTainted) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...burnBlueprint } = STATUS_CARDS[0];
            useDeckStore.getState().addCardToMasterDeck(burnBlueprint as any);
            useDeckStore.getState().addCardToMasterDeck(burnBlueprint as any);
            return `시원한 물이 온몸에 퍼지며 상처가 아물어갑니다. (체력 25 회복) ...하지만 곧 몸 안에서 이상한 열기가 느껴집니다. 오염된 물이었습니다! (덱에 [화상] 카드 2장 추가)`;
          } else {
            return `시원한 물이 온몸에 퍼지며 상처가 아물어갑니다. (체력 25 회복) 다행히도 물은 안전했습니다!`;
          }
        }
      },
      {
        label: '[물을 정화해서 조금만 마신다]',
        description: '체력을 10 회복합니다. 부작용이 없습니다.',
        onSelect: () => {
          useRunStore.getState().healPlayer(10);
          return `시간을 들여 간이 정수 작업을 한 뒤 조심스럽게 물을 마셨습니다. 완전히 갈증을 해소하진 못했지만 안전합니다. (체력 10 회복)`;
        }
      },
      {
        label: '[물가의 변이 식물을 채집한다]',
        description: '물을 마시지 않습니다. 무작위 [특수 방어] 카드를 1장 얻습니다.',
        onSelect: () => {
          const specialDefenses = ALL_CARDS.filter(c => c.type === 'SPECIAL_DEFENSE' );
          const pick = specialDefenses[Math.floor(useRngStore.getState().eventRng.next() * specialDefenses.length)];
          useDeckStore.getState().addCardToMasterDeck({ ...pick } as any);
          return `물 대신 주변의 기이한 식물 추출물을 채집했습니다. 독성 방어 재료로 쓸 수 있을 것 같습니다. [${pick.name}] 카드를 얻었습니다!`;
        }
      }
    ]
  },
  {
    id: 'evt_hologram_diary',
    title: '홀로그램 일기장',
    description: '잔해 속에서 아직 작동하는 홀로그램 프로젝터를 발견했습니다. 누군가의 전투 기록과 생존 일기가 담겨 있습니다. 프로젝터 자체도 분해하면 가치가 있어 보입니다.',
    visualDesc: '푸른 홀로그램 빛이 어둠 속에서 일렁이며 낡은 전투 기록을 투사하고 있습니다...',
    options: [
      {
        label: '[기록을 분석한다]',
        description: '덱의 카드 1장을 업그레이드합니다.',
        condition: () => useDeckStore.getState().masterDeck.some(c => !c.isUpgraded),
        onSelect: () => {
          return 'TRIGGER_CARD_UPGRADE';
        }
      },
      {
        label: '[프로젝터를 분해한다]',
        description: '골드 35를 획득하고 무작위 [일반] 카드 1장을 얻습니다.',
        onSelect: () => {
          useRunStore.getState().addGold(35);
          const commonCards = ALL_CARDS.filter(c => c.tier === 'COMMON' );
          const pick = commonCards[Math.floor(useRngStore.getState().eventRng.next() * commonCards.length)];
          useDeckStore.getState().addCardToMasterDeck({ ...pick } as any);
          return `프로젝터를 능숙하게 분해하여 부품을 챙겼습니다. 골드 35를 얻고 [${pick.name}] 카드를 획득했습니다.`;
        }
      },
      {
        label: '[무시하고 지나간다]',
        description: '아무 일도 일어나지 않습니다.',
        onSelect: () => {
          return '과거의 기록에 관심을 두지 않고 발걸음을 옮겼습니다.';
        }
      }
    ]
  },
  {
    id: 'evt_mutant_trader',
    title: '변이체 거래상',
    description: '세 개의 눈과 비늘로 뒤덮인 변이체가 길을 막아섭니다. "거래를 하자, 인간. 네 몸이든, 네 기술이든... 아니면 네 목숨이든." 기형적인 외모와는 달리 말투는 정중합니다.',
    visualDesc: '형광 초록빛 비늘이 번득이는 변이체가 낡은 가죽 가방에서 기이한 물건들을 꺼내고 있습니다...',
    options: [
      {
        label: '[최대 체력을 판다]',
        description: '최대 체력이 8 영구 감소합니다. 무작위 [희귀] 유물을 1개 획득합니다.',
        condition: () => useRunStore.getState().playerMaxHp > 8,
        onSelect: () => {
          const runStore = useRunStore.getState();
          const newMaxHp = runStore.playerMaxHp - 8;
          const newHp = Math.min(runStore.playerHp, newMaxHp);
          useRunStore.setState({ playerMaxHp: newMaxHp, playerHp: newHp });

          const rareRelics = RELICS.filter(r => r.tier === 'RARE' && !runStore.relics.includes(r.id));
          if (rareRelics.length > 0) {
            const pick = rareRelics[Math.floor(useRngStore.getState().eventRng.next() * rareRelics.length)];
            runStore.addRelic(pick.id);
            return `변이체가 당신의 생명력 일부를 빨아들였습니다. (최대 체력 -8) 대가로 빛나는 유물 [${pick.name}]을 건네줍니다.`;
          } else {
            runStore.addGold(60);
            return `변이체가 당신의 생명력 일부를 빨아들였습니다. (최대 체력 -8) 줄 유물이 없어 골드 60을 대신 건네줍니다.`;
          }
        }
      },
      {
        label: '[카드를 2장 제거한다]',
        description: '덱에서 카드 2장을 선택하여 제거합니다. 최대 체력이 15 영구 증가합니다.',
        condition: () => useDeckStore.getState().masterDeck.length >= 2,
        onSelect: () => {
          const runStore = useRunStore.getState();
          useRunStore.setState({ playerMaxHp: runStore.playerMaxHp + 15 });
          runStore.healPlayer(15);
          return 'TRIGGER_CARD_REMOVE_2';
        }
      },
      {
        label: '[공격한다]',
        description: '변이체와 전투를 시작합니다.',
        onSelect: () => {
          return 'TRIGGER_ELITE_BATTLE';
        }
      }
    ]
  },
  {
    id: 'evt_collapsed_shelter',
    title: '무너진 방공호',
    description: '폭격으로 반쯤 무너진 방공호의 입구를 발견했습니다. 안쪽에서 희미한 불빛이 새어나오지만, 천장이 언제 무너질지 모릅니다. 허리에 찬 무전기에서 가끔 잡음이 들립니다.',
    visualDesc: '콘크리트 잔해 사이로 비치는 희미한 불빛과 먼지가 자욱한 방공호 입구...',
    options: [
      {
        label: '[깊이 들어간다]',
        description: '40% 확률로 [희귀] 카드 + 골드 50. 60% 확률로 체력 -20 + [화상] 카드 추가.',
        onSelect: () => {
          const rng = useRngStore.getState().eventRng;
          if (rng.next() < 0.4) {
            useRunStore.getState().addGold(50);
            const rareCards = ALL_CARDS.filter(c => c.tier === 'RARE' );
            const pick = rareCards[Math.floor(rng.next() * rareCards.length)];
            useDeckStore.getState().addCardToMasterDeck({ ...pick } as any);
            return `방공호 깊숙한 곳에서 잘 보존된 보급품을 발견했습니다! 골드 50과 [${pick.name}] 카드를 획득했습니다!`;
          } else {
            useRunStore.getState().damagePlayer(20);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...burnBlueprint } = STATUS_CARDS[0];
            useDeckStore.getState().addCardToMasterDeck(burnBlueprint as any);
            return '천장이 무너지며 불타는 잔해가 쏟아졌습니다! 간신히 빠져나왔지만 큰 부상을 입었습니다. (체력 -20, 덱에 [화상] 카드 추가)';
          }
        }
      },
      {
        label: '[입구만 뒤진다]',
        description: '골드 25를 획득하고 체력을 10 회복합니다.',
        onSelect: () => {
          useRunStore.getState().addGold(25);
          useRunStore.getState().healPlayer(10);
          return '입구 근처에서 쓸만한 물자를 챙기고 안전하게 쉬었습니다. (골드 25 획득, 체력 10 회복)';
        }
      },
      {
        label: '[무전기로 도움을 요청한다]',
        description: '50% 확률로 무작위 유물(보스 제외)을 획득합니다. 50% 확률로 아무 일도 일어나지 않습니다.',
        onSelect: () => {
          const runStore = useRunStore.getState();
          if (useRngStore.getState().eventRng.next() < 0.5) {
            const availableRelics = RELICS.filter(r => r.tier !== 'BOSS' && !runStore.relics.includes(r.id));
            if (availableRelics.length > 0) {
              const pick = availableRelics[Math.floor(useRngStore.getState().eventRng.next() * availableRelics.length)];
              runStore.addRelic(pick.id);
              return `무전기에서 응답이 왔습니다! 근처의 생존자가 보급품을 놓고 갔습니다. [${pick.name}] 유물을 획득했습니다!`;
            } else {
              return '무전기에서 응답이 왔지만, 보낼 물자가 없다고 합니다. 허탈한 기분입니다.';
            }
          } else {
            return '무전기에서는 잡음만 들릴 뿐, 아무도 응답하지 않았습니다.';
          }
        }
      }
    ]
  },

  // ═══ 신규 — 성소 (공통, 런 당 1회) ═══
  {
    id: 'evt_shrine_upgrade', title: '강화 성소',
    description: '낡은 작업대입니다. 공구들이 아직 쓸 만합니다.',
    visualDesc: '녹슨 공구들이 정돈된 작업대 위로 빛이 비칩니다...',
    oncePerRun: true,
    options: [
      { label: '[장비를 정비한다]', description: '카드 1장 강화.', condition: () => useDeckStore.getState().masterDeck.some(c => !c.isUpgraded), onSelect: () => 'TRIGGER_CARD_UPGRADE' },
      { label: '[떠난다]', description: '아무 일 없음.', onSelect: () => '작업대를 뒤로 하고 떠났습니다.' },
    ]
  },
  {
    id: 'evt_shrine_purify', title: '정화 성소',
    description: '아직 타오르는 소각로. 불필요한 것을 태울 수 있습니다.',
    visualDesc: '붉게 타오르는 소각로에서 열기가 뿜어져 나옵니다...',
    oncePerRun: true,
    options: [
      { label: '[필요 없는 장비를 태운다]', description: '카드 1장 제거.', condition: () => useDeckStore.getState().masterDeck.length > 5, onSelect: () => 'TRIGGER_CARD_REMOVE' },
      { label: '[떠난다]', description: '아무 일 없음.', onSelect: () => '소각로를 뒤로 하고 떠났습니다.' },
    ]
  },
  {
    id: 'evt_shrine_transform', title: '변환 성소',
    description: '방사능 결정체가 빛납니다. 물건의 형태가 변하는 것 같습니다.',
    visualDesc: '보라색 빛을 뿜는 결정체 주변 공기가 왜곡됩니다...',
    oncePerRun: true,
    options: [
      { label: '[장비를 결정체에 댄다]', description: '카드 1장 제거 → 같은 타입 랜덤 카드 획득.', condition: () => useDeckStore.getState().masterDeck.length > 5, onSelect: () => {
        const ds = useDeckStore.getState(); const deck = [...ds.masterDeck];
        const ri = Math.floor(useRngStore.getState().eventRng.next() * deck.length); const removed = deck[ri]; deck.splice(ri, 1);
        const pool = ALL_CARDS.filter(c => c.type === removed.type && c.tier !== 'BASIC' && c.baseId !== removed.baseId);
        if (pool.length > 0) { const p = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; ds.setMasterDeck(deck); ds.addCardToMasterDeck({ ...p } as any); return `[${removed.name}] → [${p.name}]!`; }
        ds.setMasterDeck(deck); return `[${removed.name}]이 사라졌지만 아무것도 돌아오지 않았습니다.`;
      }},
      { label: '[떠난다]', description: '아무 일 없음.', onSelect: () => '결정체를 건드리지 않고 떠났습니다.' },
    ]
  },

  // ═══ 신규 — 탐색/NPC ═══
  {
    id: 'evt_forgotten_armory', title: '잊혀진 무기고',
    description: '무기 보관함이 열려 있습니다. 세 가지 무기 중 하나만 들 수 있습니다.',
    visualDesc: '철제 보관함에서 무기들이 먼지를 뒤집어쓴 채 빛납니다...',
    chapters: [2, 3],
    options: [
      { label: '[근접 무기]', description: '체력 -5, [희귀] 물리 공격 카드.', onSelect: () => { useRunStore.getState().damagePlayer(5); const p = ALL_CARDS.filter(c => c.tier === 'RARE' && c.type === 'PHYSICAL_ATTACK'); const pk = p[Math.floor(useRngStore.getState().eventRng.next() * p.length)]; useDeckStore.getState().addCardToMasterDeck({ ...pk } as any); return `(체력 -5) [${pk.name}] 획득!`; }},
      { label: '[화기]', description: '체력 -5, [희귀] 특수 공격 카드.', onSelect: () => { useRunStore.getState().damagePlayer(5); const p = ALL_CARDS.filter(c => c.tier === 'RARE' && c.type === 'SPECIAL_ATTACK'); const pk = p[Math.floor(useRngStore.getState().eventRng.next() * p.length)]; useDeckStore.getState().addCardToMasterDeck({ ...pk } as any); return `(체력 -5) [${pk.name}] 획득!`; }},
      { label: '[방어구]', description: '체력 -5, [희귀] 방어 카드.', onSelect: () => { useRunStore.getState().damagePlayer(5); const p = ALL_CARDS.filter(c => c.tier === 'RARE' && (c.type === 'PHYSICAL_DEFENSE' || c.type === 'SPECIAL_DEFENSE')); const pk = p[Math.floor(useRngStore.getState().eventRng.next() * p.length)]; useDeckStore.getState().addCardToMasterDeck({ ...pk } as any); return `(체력 -5) [${pk.name}] 획득!`; }},
    ]
  },
  {
    id: 'evt_storm_shelter', title: '모래폭풍 속 대피소',
    description: '모래폭풍이 몰아칩니다. 근처에 작은 동굴이 보입니다.',
    visualDesc: '모래바람 사이로 동굴 입구가 보입니다...', chapters: [1],
    options: [
      { label: '[동굴에서 쉰다]', description: '체력 20 회복.', onSelect: () => { useRunStore.getState().healPlayer(20); return '체력 20 회복!'; }},
      { label: '[폭풍 속을 뒤진다]', description: '체력 -8, 유물 1개.', onSelect: () => { useRunStore.getState().damagePlayer(8); const rs = useRunStore.getState(); const pool = RELICS.filter(r => r.tier !== 'BOSS' && r.tier !== 'STARTER' && !rs.relics.includes(r.id)); if (pool.length > 0) { const p = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; rs.addRelic(p.id); return `(체력 -8) [${p.name}] 획득!`; } return '아무것도 못 찾았습니다. (체력 -8)'; }},
      { label: '[그냥 맞는다]', description: '체력 -5.', onSelect: () => { useRunStore.getState().damagePlayer(5); return '체력 -5'; }},
    ]
  },
  {
    id: 'evt_wandering_doctor', title: '방랑 의사',
    description: '백의 노인이 간이 진료소를 차렸습니다.',
    visualDesc: '깨끗한 백의가 황무지에서 눈에 띕니다...', chapters: [2, 3],
    options: [
      { label: '[치료 (골드 30)]', description: '체력 완전 회복.', condition: () => useRunStore.getState().gold >= 30, onSelect: () => { useRunStore.getState().addGold(-30); useRunStore.getState().healPlayer(999); return '체력 완전 회복! (골드 -30)'; }},
      { label: '[증강 (골드 60)]', description: '최대 체력 +10.', condition: () => useRunStore.getState().gold >= 60, onSelect: () => { useRunStore.getState().addGold(-60); const rs = useRunStore.getState(); useRunStore.setState({ playerMaxHp: rs.playerMaxHp + 10 }); rs.healPlayer(10); return '최대 체력 +10! (골드 -60)'; }},
      { label: '[대가 없이 떠난다]', description: '체력 15 회복.', onSelect: () => { useRunStore.getState().healPlayer(15); return '체력 15 회복'; }},
    ]
  },
  {
    id: 'evt_scrap_gambler', title: '고철 도박사',
    description: '고철 룰렛을 돌리는 도박사. "한 판 돌려보시겠소?"',
    visualDesc: '금속 룰렛이 딸깍거리며 돌아갑니다...', chapters: [2],
    options: [
      { label: '[소액 (골드 25)]', description: '50% 골드 50, 50% 잃음.', condition: () => useRunStore.getState().gold >= 25, onSelect: () => { useRunStore.getState().addGold(-25); if (useRngStore.getState().eventRng.next() < 0.5) { useRunStore.getState().addGold(50); return '당첨! (+25 순이익)'; } return '빗나갔습니다... (-25)'; }},
      { label: '[대형 (골드 50)]', description: '40% 유물/30% 골드/30% 잃음.', condition: () => useRunStore.getState().gold >= 50, onSelect: () => { useRunStore.getState().addGold(-50); const r = useRngStore.getState().eventRng.next(); if (r < 0.4) { const rs = useRunStore.getState(); const pool = RELICS.filter(x => x.tier === 'RARE' && !rs.relics.includes(x.id)); if (pool.length > 0) { const p = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; rs.addRelic(p.id); return `대박! [${p.name}]!`; } useRunStore.getState().addGold(100); return '골드로 대체! (+50)'; } else if (r < 0.7) { useRunStore.getState().addGold(100); return '잭팟! (+50)'; } return '잃었습니다... (-50)'; }},
      { label: '[도박사를 턴다]', description: '골드 20, 50% 전투.', onSelect: () => { useRunStore.getState().addGold(20); if (useRngStore.getState().eventRng.next() < 0.5) return 'TRIGGER_ELITE_BATTLE'; return '도주 성공! (+20)'; }},
    ]
  },

  // ═══ 신규 — 2막 전용 ═══
  {
    id: 'evt_ghost_train', title: '지하철 유령 열차',
    description: '어둠 속에서 열차가 다가옵니다. 무인 운행 중인 것 같습니다.',
    visualDesc: '녹슨 열차의 헤드라이트가 터널을 비춥니다...', chapters: [2],
    options: [
      { label: '[올라탄다]', description: '50% 골드 80+강화, 50% 체력 -12+화상.', onSelect: () => { if (useRngStore.getState().eventRng.next() < 0.5) { useRunStore.getState().addGold(80); return 'TRIGGER_CARD_UPGRADE'; } useRunStore.getState().damagePlayer(12); const { id: _id, ...b } = STATUS_CARDS[0]; useDeckStore.getState().addCardToMasterDeck(b as any); return '탈선! (체력 -12, [화상])'; }},
      { label: '[선로를 뒤진다]', description: '골드 30 + [변화] 카드.', onSelect: () => { useRunStore.getState().addGold(30); const pool = ALL_CARDS.filter(c => c.type === 'UTILITY' && c.tier !== 'BASIC'); const pk = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; useDeckStore.getState().addCardToMasterDeck({ ...pk } as any); return `골드 30 + [${pk.name}]!`; }},
      { label: '[기다린다]', description: '아무 일 없음.', onSelect: () => '열차가 사라져갔습니다.' },
    ]
  },
  {
    id: 'evt_tunnel_hideout', title: '터널 속 은신처',
    description: '누군가의 은신처. 침낭과 보급품이 있습니다.',
    visualDesc: '방수포 안에 아늑한 공간이 있습니다...', chapters: [2],
    options: [
      { label: '[하룻밤 머문다]', description: '체력 25 회복 + 카드 강화.', onSelect: () => { useRunStore.getState().healPlayer(25); return 'TRIGGER_CARD_UPGRADE'; }},
      { label: '[보급품 챙기기]', description: '골드 40 + [일반] 카드.', onSelect: () => { useRunStore.getState().addGold(40); const pool = ALL_CARDS.filter(c => c.tier === 'COMMON'); const pk = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; useDeckStore.getState().addCardToMasterDeck({ ...pk } as any); return `골드 40 + [${pk.name}]!`; }},
      { label: '[함정 경계]', description: '체력 -5, [고급] 유물.', onSelect: () => { useRunStore.getState().damagePlayer(5); const rs = useRunStore.getState(); const pool = RELICS.filter(x => x.tier === 'UNCOMMON' && !rs.relics.includes(x.id)); if (pool.length > 0) { const p = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; rs.addRelic(p.id); return `(체력 -5) [${p.name}] 획득!`; } return '아무것도 없었습니다. (-5)'; }},
    ]
  },

  // ═══ 신규 — 3막 전용 ═══
  {
    id: 'evt_ancient_duplicator', title: '고대 복제 장치',
    description: '기업의 실험용 복제기가 에너지를 뿜고 있습니다.',
    visualDesc: '장치에서 파란 에너지가 순환하고 있습니다...', chapters: [3],
    options: [
      { label: '[카드 복제]', description: '카드 1장 선택하여 복제.', onSelect: () => 'TRIGGER_CARD_DUPLICATE' },
      { label: '[분해]', description: '골드 60.', onSelect: () => { useRunStore.getState().addGold(60); return '부품을 챙겼습니다. (골드 60)'; }},
      { label: '[떠난다]', description: '아무 일 없음.', onSelect: () => '손대지 않기로 했습니다.' },
    ]
  },
  {
    id: 'evt_ai_diagnostic', title: 'AI 진단 시스템',
    description: '기업 의료 AI가 가동 중입니다. "스캔을 시작합니다."',
    visualDesc: '홀로그램에 인체 스캔 데이터가 떠오릅니다...', chapters: [3],
    options: [
      { label: '[풀 스캔]', description: '카드 2장 강화 + [방사능 오염] 추가.', condition: () => useDeckStore.getState().masterDeck.filter(c => !c.isUpgraded).length >= 2, onSelect: () => { const ds = useDeckStore.getState(); const tgts = customShuffle(ds.masterDeck.filter(c => !c.isUpgraded), useRngStore.getState().eventRng).slice(0, 2); tgts.forEach(t => ds.upgradeCard(t.id)); const { id: _id, ...rad } = STATUS_CARDS[1]; ds.addCardToMasterDeck(rad as any); return `[${tgts.map(t => t.name).join(', ')}] 강화! ([방사능 오염] 추가)`; }},
      { label: '[퀵 스캔]', description: '카드 1장 강화.', condition: () => useDeckStore.getState().masterDeck.some(c => !c.isUpgraded), onSelect: () => 'TRIGGER_CARD_UPGRADE' },
      { label: '[해킹]', description: '체력 -10, [희귀] 카드.', onSelect: () => { useRunStore.getState().damagePlayer(10); const pool = ALL_CARDS.filter(c => c.tier === 'RARE'); const pk = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; useDeckStore.getState().addCardToMasterDeck({ ...pk } as any); return `(체력 -10) [${pk.name}] 획득!`; }},
    ]
  },
  {
    id: 'evt_corporate_lab', title: '기업 실험실',
    description: '방주 내부 생체 실험실. 약품이 진열되어 있습니다.',
    visualDesc: '형광 조명 아래 약품들이 빛납니다...', chapters: [3],
    options: [
      { label: '[혈청 주입]', description: '최대 체력 +8, [화상] 추가.', onSelect: () => { const rs = useRunStore.getState(); useRunStore.setState({ playerMaxHp: rs.playerMaxHp + 8 }); rs.healPlayer(8); const { id: _id, ...b } = STATUS_CARDS[0]; useDeckStore.getState().addCardToMasterDeck(b as any); return '최대 체력 +8! ([화상] 추가)'; }},
      { label: '[안정제 복용]', description: '상태이상 카드 전부 제거.', onSelect: () => { const ds = useDeckStore.getState(); const isS = (c: { type: string }) => c.type === 'STATUS_BURN' || c.type === 'STATUS_RADIATION'; const cnt = ds.masterDeck.filter(isS).length; if (cnt > 0) { ds.setMasterDeck(ds.masterDeck.filter(c => !isS(c))); return `정화! (${cnt}장 제거)`; } return '변화 없음.'; }},
      { label: '[약품 파괴]', description: '골드 50 + [변화] 카드.', onSelect: () => { useRunStore.getState().addGold(50); const pool = ALL_CARDS.filter(c => c.type === 'UTILITY' && c.tier !== 'BASIC'); const pk = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; useDeckStore.getState().addCardToMasterDeck({ ...pk } as any); return `골드 50 + [${pk.name}]!`; }},
    ]
  },
  {
    id: 'evt_security_protocol', title: '최종 보안 프로토콜',
    description: '보안 시스템이 침입자를 감지했습니다. 잠긴 문 너머에 장비가 보입니다.',
    visualDesc: '붉은 경고등이 깜빡입니다...', chapters: [3],
    options: [
      { label: '[해킹]', description: '체력 -8, [희귀] 유물.', onSelect: () => { useRunStore.getState().damagePlayer(8); const rs = useRunStore.getState(); const pool = RELICS.filter(x => x.tier === 'RARE' && !rs.relics.includes(x.id)); if (pool.length > 0) { const p = pool[Math.floor(useRngStore.getState().eventRng.next() * pool.length)]; rs.addRelic(p.id); return `해킹 성공! (체력 -8) [${p.name}]!`; } return '비어있었습니다. (-8)'; }},
      { label: '[우회]', description: '골드 30 + 카드 강화.', onSelect: () => { useRunStore.getState().addGold(30); return 'TRIGGER_CARD_UPGRADE'; }},
      { label: '[경보]', description: '엘리트 전투.', onSelect: () => 'TRIGGER_ELITE_BATTLE' },
    ]
  },
];
