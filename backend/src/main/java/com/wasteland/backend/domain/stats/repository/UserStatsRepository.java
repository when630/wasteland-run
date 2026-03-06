package com.wasteland.backend.domain.stats.repository;

import com.wasteland.backend.domain.stats.entity.UserStats;
import com.wasteland.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserStatsRepository extends JpaRepository<UserStats, Long> {
  Optional<UserStats> findByUser(User user);
}
