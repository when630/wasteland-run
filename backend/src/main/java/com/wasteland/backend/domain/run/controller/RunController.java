package com.wasteland.backend.domain.run.controller;

import com.wasteland.backend.domain.run.dto.RunResponseDto;
import com.wasteland.backend.domain.run.dto.RunSaveRequestDto;
import com.wasteland.backend.domain.run.service.RunService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/run")
@RequiredArgsConstructor
public class RunController {

    private final RunService runService;

    @GetMapping
    public ResponseEntity<RunResponseDto> getRunData(Authentication authentication) {
        String username = authentication.getName();
        RunResponseDto responseDto = runService.getRun(username);
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping
    public ResponseEntity<RunResponseDto> saveRunData(Authentication authentication,
                                                      @RequestBody RunSaveRequestDto requestDto) {
        String username = authentication.getName();
        RunResponseDto responseDto = runService.saveOrUpdateRun(username, requestDto);
        return ResponseEntity.ok(responseDto);
    }
}
