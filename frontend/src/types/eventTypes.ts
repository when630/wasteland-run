export interface EventOption {
  label: string; // 버튼에 표시될 주 텍스트 (예: "[손을 집어넣는다]")
  description: string; // 부가 설명 텍스트

  /**
   * 조건을 만족하지 못하면 버튼이 비활성화됩니다.
   * boolean을 반환하거나, 에러 메시지(string)를 반환할 수도 있으나 현재는 판단만 합니다.
   * (e.g., 골드 부족, 특정 카드 없음 등)
   */
  condition?: () => boolean;

  /**
   * 해당 선택지를 골랐을 때 실행되는 함수. 
   * 스토어 변조, 알림 호출, 화면 전환(전투) 등을 제어합니다.
   * 반환값(string)은 선택 이후 출력해줄 '결과 텍스트'로 활용합니다.
   */
  onSelect: () => string;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  visualDesc: string; // 분위기를 묘사하는 문구
  options: EventOption[];
  chapters?: number[]; // 등장 가능 챕터 (미지정 시 전 챕터)
  oncePerRun?: boolean; // 런 당 1회만 등장 (성소 등)
}
