package com.wasteland.backend.domain.stats.entity;

import com.wasteland.backend.domain.user.entity.User;
import com.wasteland.backend.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_stats")
public class UserStats extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  // 런 기록
  @Builder.Default
  private int totalRuns = 0;
  @Builder.Default
  private int totalClears = 0;
  @Builder.Default
  private int highestFloor = 0;

  // 전투 기록
  @Builder.Default
  private int totalKills = 0;
  @Builder.Default
  private long totalDamageDealt = 0;
  @Builder.Default
  private long totalDamageTaken = 0;

  // 자원 기록
  @Builder.Default
  private int totalCardsPlayed = 0;
  @Builder.Default
  private long totalGoldEarned = 0;

  // 최다 사용 카드/유물 (이름 기준)
  @Column(length = 100)
  private String favoriteCard;
  @Builder.Default
  private int favoriteCardCount = 0;

  @Column(length = 100)
  private String favoriteRelic;
  @Builder.Default
  private int favoriteRelicCount = 0;

  /**
   * 런 종료 시 누적 통계에 해당 런의 통계를 병합합니다.
   */
  public void mergeRunStats(int kills, long damageDealt, long damageTaken,
      int cardsPlayed, long goldEarned,
      int reachedFloor, boolean isCleared) {
    this.totalRuns++;
    if (isCleared)
      this.totalClears++;
    if (reachedFloor > this.highestFloor)
      this.highestFloor = reachedFloor;
    this.totalKills += kills;
    this.totalDamageDealt += damageDealt;
    this.totalDamageTaken += damageTaken;
    this.totalCardsPlayed += cardsPlayed;
    this.totalGoldEarned += goldEarned;
  }

  public void updateFavoriteCard(String cardName, int count) {
    if (count > this.favoriteCardCount) {
      this.favoriteCard = cardName;
      this.favoriteCardCount = count;
    }
  }

  public void updateFavoriteRelic(String relicId, int count) {
    if (count > this.favoriteRelicCount) {
      this.favoriteRelic = relicId;
      this.favoriteRelicCount = count;
    }
  }
}
