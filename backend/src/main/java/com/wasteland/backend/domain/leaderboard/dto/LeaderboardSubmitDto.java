package com.wasteland.backend.domain.leaderboard.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LeaderboardSubmitDto {
    private int score;
    private int clearLayer;
    private long playTimeSeconds;
}
