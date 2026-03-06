package com.wasteland.backend.domain.stats.dto;

import com.wasteland.backend.domain.stats.entity.UserStats;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserStatsDto {
  private int totalRuns;
  private int totalClears;
  private int highestFloor;
  private int totalKills;
  private long totalDamageDealt;
  private long totalDamageTaken;
  private int totalCardsPlayed;
  private long totalGoldEarned;
  private String favoriteCard;
  private int favoriteCardCount;
  private String favoriteRelic;
  private int favoriteRelicCount;

  public static UserStatsDto of(UserStats stats) {
    return new UserStatsDto(
        stats.getTotalRuns(),
        stats.getTotalClears(),
        stats.getHighestFloor(),
        stats.getTotalKills(),
        stats.getTotalDamageDealt(),
        stats.getTotalDamageTaken(),
        stats.getTotalCardsPlayed(),
        stats.getTotalGoldEarned(),
        stats.getFavoriteCard(),
        stats.getFavoriteCardCount(),
        stats.getFavoriteRelic(),
        stats.getFavoriteRelicCount());
  }
}
