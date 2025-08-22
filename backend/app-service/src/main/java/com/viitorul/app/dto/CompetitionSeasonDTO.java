// src/main/java/com/viitorul/app/dto/CompetitionSeasonDTO.java
package com.viitorul.app.dto;

import com.viitorul.app.entity.CompetitionSeason;
import lombok.Data;

@Data
public class CompetitionSeasonDTO {
    private Long id;
    private Long competitionId;
    private String label;    // ex: "2024/2025"
    private boolean active;

    public static CompetitionSeasonDTO fromEntity(CompetitionSeason s) {
        if (s == null) return null;
        CompetitionSeasonDTO dto = new CompetitionSeasonDTO();
        dto.setId(s.getId());
        dto.setCompetitionId(s.getCompetition() != null ? s.getCompetition().getId() : null);
        dto.setLabel(s.getLabel());
        dto.setActive(s.isActive());
        return dto;
    }
}
