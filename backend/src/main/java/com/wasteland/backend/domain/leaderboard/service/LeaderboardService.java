package com.wasteland.backend.domain.leaderboard.service;

import com.wasteland.backend.domain.leaderboard.dto.LeaderboardItemDto;
import com.wasteland.backend.domain.leaderboard.dto.LeaderboardSubmitDto;
import com.wasteland.backend.domain.leaderboard.entity.Leaderboard;
import com.wasteland.backend.domain.leaderboard.repository.LeaderboardRepository;
import com.wasteland.backend.domain.user.entity.User;
import com.wasteland.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;

    @Transactional
    public void submitScore(String username, LeaderboardSubmitDto submitDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Leaderboard leaderboardEntry = Leaderboard.builder()
                .user(user)
                .score(submitDto.getScore())
                .clearLayer(submitDto.getClearLayer())
                .playTimeSeconds(submitDto.getPlayTimeSeconds())
                .build();

        leaderboardRepository.save(leaderboardEntry);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardItemDto> getTop50() {
        return leaderboardRepository.findTop50WithUser()
                .stream()
                .map(LeaderboardItemDto::of)
                .collect(Collectors.toList());
    }
}
