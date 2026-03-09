package com.wasteland.backend.domain.leaderboard.repository;

import com.wasteland.backend.domain.leaderboard.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {

    // N+1 방지: User를 FETCH JOIN으로 함께 조회
    @Query("SELECT l FROM Leaderboard l JOIN FETCH l.user ORDER BY l.score DESC, l.playTimeSeconds ASC LIMIT 50")
    List<Leaderboard> findTop50WithUser();
}
