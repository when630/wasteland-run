package com.wasteland.backend.domain.run.dto;

import com.wasteland.backend.domain.run.entity.RunData;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RunResponseDto {
    private Long runId;
    private int currentHp;
    private int maxHp;
    private int currentLayer;
    private int gold;
    private String deckJson;
    private String relicsJson;
    private String runSeed;
    private String currentScene;
    private String currentMapNode;
    private boolean isActive;
    private int enemiesKilled;

    public static RunResponseDto of(RunData runData) {
        return new RunResponseDto(
                runData.getId(),
                runData.getCurrentHp(),
                runData.getMaxHp(),
                runData.getCurrentLayer(),
                runData.getGold(),
                runData.getDeckJson(),
                runData.getRelicsJson(),
                runData.getRunSeed(),
                runData.getCurrentScene(),
                runData.getCurrentMapNode(),
                runData.isActive(),
                runData.getEnemiesKilled());
    }
}
