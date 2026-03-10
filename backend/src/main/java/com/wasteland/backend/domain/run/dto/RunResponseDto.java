package com.wasteland.backend.domain.run.dto;

import com.wasteland.backend.domain.run.entity.RunData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
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
    private int cardsPlayed;
    private long totalDamageDealt;
    private long totalDamageTaken;
    private long totalGoldEarned;
    private String mapJson;

    public static RunResponseDto of(RunData runData) {
        return RunResponseDto.builder()
                .runId(runData.getId())
                .currentHp(runData.getCurrentHp())
                .maxHp(runData.getMaxHp())
                .currentLayer(runData.getCurrentLayer())
                .gold(runData.getGold())
                .deckJson(runData.getDeckJson())
                .relicsJson(runData.getRelicsJson())
                .runSeed(runData.getRunSeed())
                .currentScene(runData.getCurrentScene())
                .currentMapNode(runData.getCurrentMapNode())
                .isActive(runData.isActive())
                .enemiesKilled(runData.getEnemiesKilled())
                .cardsPlayed(runData.getCardsPlayed())
                .totalDamageDealt(runData.getTotalDamageDealt())
                .totalDamageTaken(runData.getTotalDamageTaken())
                .totalGoldEarned(runData.getTotalGoldEarned())
                .mapJson(runData.getMapJson())
                .build();
    }
}
