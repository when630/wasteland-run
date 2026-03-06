package com.wasteland.backend.domain.run.entity;

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
@Table(name = "run_data")
public class RunData extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 현재 상흔(체력) 상태
    private int currentHp;
    // 최대 체력
    private int maxHp;

    // 현재 진행 중인 맵 층수
    private int currentLayer;

    // 소지 골드
    private int gold;

    // JSON 형태 직렬화 문자열: [ { id, name, type ... } ]
    @Column(columnDefinition = "TEXT")
    private String deckJson;

    // JSON 형태 직렬화 문자열: [ { id, level, uses ... } ]
    @Column(columnDefinition = "TEXT")
    private String relicsJson;

    // [NEW] 런 난수 생성용 시드값
    private String runSeed;

    // [NEW] 현재 위치한 화면 (MAP, BATTLE 등)
    private String currentScene;

    // [NEW] 맵 노드 ID (현재 위치)
    private String currentMapNode;

    // [NEW] 런의 진행 중 여부 (클리어/사망 시 false)
    private boolean isActive;

    // [NEW] 런 동안 처치한 적 수
    private int enemiesKilled;

    public void updateRun(int currentHp, int maxHp, int currentLayer, int gold,
            String deckJson, String relicsJson,
            String runSeed, String currentScene,
            String currentMapNode, boolean isActive, int enemiesKilled) {
        this.currentHp = currentHp;
        this.maxHp = maxHp;
        this.currentLayer = currentLayer;
        this.gold = gold;
        this.deckJson = deckJson;
        this.relicsJson = relicsJson;
        this.runSeed = runSeed;
        this.currentScene = currentScene;
        this.currentMapNode = currentMapNode;
        this.isActive = isActive;
        this.enemiesKilled = enemiesKilled;
    }
}
