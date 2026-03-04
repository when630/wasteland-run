package com.wasteland.backend.domain.leaderboard.controller;

import com.wasteland.backend.domain.leaderboard.dto.LeaderboardItemDto;
import com.wasteland.backend.domain.leaderboard.dto.LeaderboardSubmitDto;
import com.wasteland.backend.domain.leaderboard.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @PostMapping
    public ResponseEntity<String> submitScore(Authentication authentication, @RequestBody LeaderboardSubmitDto submitDto) {
        String username = authentication.getName();
        leaderboardService.submitScore(username, submitDto);
        return ResponseEntity.ok("점수가 성공적으로 등록되었습니다.");
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardItemDto>> getLeaderboard() {
        List<LeaderboardItemDto> top50 = leaderboardService.getTop50();
        return ResponseEntity.ok(top50);
    }
}
