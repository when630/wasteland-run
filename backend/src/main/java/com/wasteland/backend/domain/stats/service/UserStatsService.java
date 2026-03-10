package com.wasteland.backend.domain.stats.service;

import com.wasteland.backend.domain.stats.dto.RunStatsSubmitDto;
import com.wasteland.backend.domain.stats.dto.UserStatsDto;
import com.wasteland.backend.domain.stats.entity.UserStats;
import com.wasteland.backend.domain.stats.repository.UserStatsRepository;
import com.wasteland.backend.domain.user.entity.User;
import com.wasteland.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserStatsService {

  private final UserStatsRepository userStatsRepository;
  private final UserService userService;

  @Transactional
  public void submitRunStats(String username, RunStatsSubmitDto dto) {
    User user = userService.findByUsernameOrThrow(username);

    // 유저의 기존 통계를 가져오거나, 없으면 새로 생성
    UserStats stats = userStatsRepository.findByUser(user)
        .orElseGet(() -> {
          UserStats newStats = UserStats.builder().user(user).build();
          return userStatsRepository.save(newStats);
        });

    // 런 통계 병합
    stats.mergeRunStats(
        dto.getEnemiesKilled(),
        dto.getDamageDealt(),
        dto.getDamageTaken(),
        dto.getCardsPlayed(),
        dto.getGoldEarned(),
        dto.getReachedFloor(),
        dto.isCleared());

    // 카드 사용 빈도 처리 — 최다 사용 카드 갱신
    if (dto.getCardUsageMap() != null) {
      dto.getCardUsageMap().forEach((cardName, count) -> stats.updateFavoriteCard(cardName, count));
    }

    // 유물 사용 빈도 처리 — 최다 획득 유물 갱신
    if (dto.getRelicUsageMap() != null) {
      dto.getRelicUsageMap().forEach((relicId, count) -> stats.updateFavoriteRelic(relicId, count));
    }

    userStatsRepository.save(stats);
  }

  @Transactional(readOnly = true)
  public UserStatsDto getUserStats(String username) {
    User user = userService.findByUsernameOrThrow(username);

    UserStats stats = userStatsRepository.findByUser(user)
        .orElseGet(() -> {
          // 아직 통계가 없으면 빈 통계 반환
          return UserStats.builder().user(user).build();
        });

    return UserStatsDto.of(stats);
  }
}
