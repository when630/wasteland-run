package com.wasteland.backend.domain.run.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RunSaveRequestDto {
    private int currentHp;
    private int maxHp;
    private int currentLayer;
    private int gold;
    // JSON 직렬화 배열 문자열
    private String deckJson;
    // JSON 직렬화 배열 문자열
    private String relicsJson;

    private String runSeed;
    private String currentScene;
    private String currentMapNode;
    private boolean isActive;
    private int enemiesKilled;
}
