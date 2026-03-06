package com.wasteland.backend.domain.stats.controller;

import com.wasteland.backend.domain.stats.dto.RunStatsSubmitDto;
import com.wasteland.backend.domain.stats.dto.UserStatsDto;
import com.wasteland.backend.domain.stats.service.UserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stats")
public class UserStatsController {

  private final UserStatsService userStatsService;

  @PostMapping("/submit")
  public ResponseEntity<String> submitRunStats(Authentication authentication, @RequestBody RunStatsSubmitDto dto) {
    String username = authentication.getName();
    userStatsService.submitRunStats(username, dto);
    return ResponseEntity.ok("통계가 기록되었습니다.");
  }

  @GetMapping
  public ResponseEntity<UserStatsDto> getUserStats(Authentication authentication) {
    String username = authentication.getName();
    UserStatsDto stats = userStatsService.getUserStats(username);
    return ResponseEntity.ok(stats);
  }
}
