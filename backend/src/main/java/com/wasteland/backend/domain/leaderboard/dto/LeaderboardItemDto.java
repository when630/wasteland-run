package com.wasteland.backend.domain.leaderboard.dto;

import com.wasteland.backend.domain.leaderboard.entity.Leaderboard;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaderboardItemDto {
    private String username;
    private int score;
    private int clearLayer;
    private long playTimeSeconds;

    public static LeaderboardItemDto of(Leaderboard leaderboard) {
        return new LeaderboardItemDto(
                leaderboard.getUser().getUsername(),
                leaderboard.getScore(),
                leaderboard.getClearLayer(),
                leaderboard.getPlayTimeSeconds()
        );
    }
}
