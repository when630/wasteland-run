import type { RandomEvent } from '../../types/eventTypes';
import { useRunStore } from '../../store/useRunStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useRngStore } from '../../store/useRngStore';
import { RELICS } from './relics';
import { ALL_CARDS, STARTING_CARDS, STATUS_CARDS } from './cards';
import { customShuffle } from '../../utils/rng';

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
          const rareCards = ALL_CARDS.filter(c => c.tier === 'RARE');
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

          const uncommonCards = ALL_CARDS.filter(c => c.tier === 'UNCOMMON');
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
          const specialDefenses = ALL_CARDS.filter(c => c.type === 'SPECIAL_DEFENSE');
          const pick = specialDefenses[Math.floor(useRngStore.getState().eventRng.next() * specialDefenses.length)];
          useDeckStore.getState().addCardToMasterDeck({ ...pick } as any);
          return `물 대신 주변의 기이한 식물 추출물을 채집했습니다. 독성 방어 재료로 쓸 수 있을 것 같습니다. [${pick.name}] 카드를 얻었습니다!`;
        }
      }
    ]
  }
];
