export type IntentType = 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'UNKNOWN';

export interface Intent {
  type: IntentType;
  amount?: number;     // 예상 데미지 혹은 방어도 수치
  description: string; // "물리 공격 10", "방어도 5 증가" 등 UI용 텍스트
}

export interface Enemy {
  id: string;          // 인스턴스 ID (한 번에 같은 적 여럿 등장 대비)
  baseId: string;      // 적의 원본 ID (예: 'scrap_collector')
  name: string;        // 적 이름
  maxHp: number;
  currentHp: number;
  shield: number;      // 물리 방어도 (피격 시 우선 깎임)
  resist: number;      // 특수 방어도 (특수 공격 피격 시 우선 깎임)
  currentIntent: Intent | null; // 현재 턴에 하려는 행동
  visualEffect?: { type: 'DAMAGE' | 'BUFF'; tick: number }; // 피격, 버프 등 시각적 애니메이션 발현 시점 타이머
}
