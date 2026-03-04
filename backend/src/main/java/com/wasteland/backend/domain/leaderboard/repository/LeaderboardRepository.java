package com.wasteland.backend.domain.leaderboard.repository;

import com.wasteland.backend.domain.leaderboard.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    
    // 점수 내림차순, 클리어 타임 오름차순 기준 TOP N 조회를 위한 쿼리
    List<Leaderboard> findTop50ByOrderByScoreDescPlayTimeSecondsAsc();
}
