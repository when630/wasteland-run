package com.wasteland.backend.domain.leaderboard.entity;

import com.wasteland.backend.domain.user.entity.User;
import com.wasteland.backend.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "leaderboard")
public class Leaderboard extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 클리어 당시 산정된 점수 (높을수록 상위권)
    private int score;

    // 클리어 층수 (보통 끝까지 갔는지를 나타냄)
    private int clearLayer;

    // 게임 시작부터 클리어 시점까지 걸린 총 플레이 타임 (초 단위)
    private long playTimeSeconds;

}
