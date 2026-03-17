export type IntentType = 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'UNKNOWN';
export type DamageType = 'PHYSICAL' | 'SPECIAL' | 'PIERCING';
export type EnemyTier = 'NORMAL' | 'ELITE' | 'BOSS';

export interface Intent {
  type: IntentType;
  amount?: number;     // 예상 데미지 혹은 방어도 수치
  damageType?: DamageType; // 공격일 때 물리인지 특수인지 구분
  description: string; // "물리 공격 10", "방어도 5 증가" 등 UI용 텍스트
  applyDebuff?: { status: string; amount: number }; // 피격 시 플레이어에게 부여할 디버프
}

export interface Enemy {
  id: string;          // 인스턴스 ID (한 번에 같은 적 여럿 등장 대비)
  baseId: string;      // 적의 원본 ID (예: 'scrap_collector')
  tier: EnemyTier;     // 적 등급 (일반, 엘리트, 보스)
  name: string;        // 적 이름
  chapter?: number;    // 소속 챕터 (1, 2, 3)
  maxHp: number;
  currentHp: number;
  shield: number;      // 물리 방어도 (피격 시 우선 깎임)
  resist: number;      // 특수 방어도 (특수 공격 피격 시 우선 깎임)
  currentIntent: Intent | null; // 현재 턴에 하려는 행동
  nextIntent?: Intent | null;   // 다음 턴 의도 (예언의 수정구용)
  statuses?: Record<string, number>; // 상태이상 (VULNERABLE, WEAK, BURN, POISON 등)
  visualEffect?: { type: 'DAMAGE' | 'BUFF' | 'BURN_TICK' | 'POISON_TICK' | 'BURN_POISON_TICK' | 'ATTACKING'; tick: number };
  spriteUrl?: string;        // 기본 스프라이트 이미지
  spriteAttackUrl?: string;  // 공격 스프라이트 이미지
  spriteHitUrl?: string;     // 피격 스프라이트 이미지
}
