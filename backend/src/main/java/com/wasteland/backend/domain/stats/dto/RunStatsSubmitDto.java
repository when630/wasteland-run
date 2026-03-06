package com.wasteland.backend.domain.stats.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class RunStatsSubmitDto {
  private int enemiesKilled;
  private long damageDealt;
  private long damageTaken;
  private int cardsPlayed;
  private long goldEarned;
  private int reachedFloor;
  private boolean cleared;
  // 카드별 사용 횟수: { "낡은 쇠파이프": 15, "화염병": 8, ... }
  private Map<String, Integer> cardUsageMap;
  // 유물 목록: { "arc_heart": 1, "glow_watch": 1, ... }
  private Map<String, Integer> relicUsageMap;
}
