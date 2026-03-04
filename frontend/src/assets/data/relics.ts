import type { Relic } from '../../types/relicTypes';

export const RELICS: Relic[] = [
  {
    id: 'bloody_bandolier',
    name: '피 묻은 가죽 탄띠',
    tier: 'COMMON',
    description: '매 전투 시작 시 [탄약] 1을 가지고 시작합니다.',
    icon: '🪖',
  },
  {
    id: 'old_medkit',
    name: '구시대의 구급상자',
    tier: 'COMMON',
    description: '[특수 공격] 카드로 적을 처치할 때마다 체력을 3 회복합니다.',
    icon: '🚑',
  },
  {
    id: 'glow_watch',
    name: '방사능 야광 시계',
    tier: 'UNCOMMON', // 기획서의 [특별] 등급
    description: '매 전투의 첫 턴에 행동력(AP)을 1 추가로 얻습니다.',
    icon: '⌚',
  },
  {
    id: 'alloy_plating',
    name: '이중 합금 장갑판',
    tier: 'RARE',
    description: '[물리 방어] 사용 시 특수 방어도 2 획득. [특수 방어] 사용 시 물리 방어도 2 획득.',
    icon: '🛡️',
  },
  {
    id: 'arc_heart',
    name: '불안정한 아크 심장',
    tier: 'BOSS',
    description: '매 턴 시작 시 행동력(AP)을 1 추가로 얻습니다. (매 턴 첫 번째로 사용하는 [변화] 카드가 무작위 대상을 지정합니다.)',
    icon: '💙',
  }
];
