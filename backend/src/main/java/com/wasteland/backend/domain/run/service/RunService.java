package com.wasteland.backend.domain.run.service;

import com.wasteland.backend.domain.run.dto.RunResponseDto;
import com.wasteland.backend.domain.run.dto.RunSaveRequestDto;
import com.wasteland.backend.domain.run.entity.RunData;
import com.wasteland.backend.domain.run.repository.RunRepository;
import com.wasteland.backend.domain.user.entity.User;
import com.wasteland.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RunService {

    private final RunRepository runRepository;
    private final UserRepository userRepository;

    @Transactional
    public RunResponseDto saveOrUpdateRun(String username, RunSaveRequestDto requestDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        RunData runData = runRepository.findByUser(user)
                .orElseGet(() -> RunData.builder()
                        .user(user)
                        .build());

        runData.updateRun(
                requestDto.getCurrentHp(),
                requestDto.getMaxHp(),
                requestDto.getCurrentLayer(),
                requestDto.getGold(),
                requestDto.getDeckJson(),
                requestDto.getRelicsJson()
        );

        RunData saved = runRepository.save(runData);
        return RunResponseDto.of(saved);
    }

    @Transactional(readOnly = true)
    public RunResponseDto getRun(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        RunData runData = runRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("저장된 런 데이터가 없습니다."));

        return RunResponseDto.of(runData);
    }
}
