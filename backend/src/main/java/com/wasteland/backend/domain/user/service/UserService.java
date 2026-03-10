package com.wasteland.backend.domain.user.service;

import com.wasteland.backend.domain.user.dto.AuthRequestDto;
import com.wasteland.backend.domain.user.dto.AuthResponseDto;
import com.wasteland.backend.domain.user.entity.User;
import com.wasteland.backend.domain.user.entity.User.Role;
import com.wasteland.backend.domain.user.repository.UserRepository;
import com.wasteland.backend.global.exception.DuplicateUsernameException;
import com.wasteland.backend.global.exception.UserNotFoundException;
import com.wasteland.backend.global.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public AuthResponseDto register(AuthRequestDto requestDto) {
        if (userRepository.existsByUsername(requestDto.getUsername())) {
            throw new DuplicateUsernameException("이미 존재하는 유저명입니다.");
        }

        User user = User.builder()
                .username(requestDto.getUsername())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        // 가입 직후 자동 로그인을 위해 토큰 발급
        String token = createTokenForUser(user);
        return new AuthResponseDto(token, user.getUsername());
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(AuthRequestDto requestDto) {
        User user = userRepository.findByUsername(requestDto.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 유저명입니다."));

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }

        String token = createTokenForUser(user);
        return new AuthResponseDto(token, user.getUsername());
    }

    public User findByUsernameOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + username));
    }

    private String createTokenForUser(User user) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        "",
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                ),
                "",
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        return jwtProvider.createToken(authentication);
    }
}
