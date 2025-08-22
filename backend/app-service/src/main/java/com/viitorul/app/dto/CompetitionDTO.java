// src/main/java/com/viitorul/app/dto/CompetitionDTO.java
package com.viitorul.app.dto;

import com.viitorul.app.entity.Competition;
import com.viitorul.app.entity.CompetitionSeason;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class CompetitionDTO {
    private Long id;
    private String name;
    private boolean active;
    private List<CompetitionSeasonDTO> seasons;

    public static CompetitionDTO fromEntity(Competition c, boolean includeSeasons) {
        if (c == null) return null;
        CompetitionDTO dto = new CompetitionDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setActive(c.isActive());
        if (includeSeasons && c.getSeasons() != null) {
            dto.setSeasons(
                    c.getSeasons().stream()
                            .filter(CompetitionSeason::isActive)
                            .map(CompetitionSeasonDTO::fromEntity)
                            .collect(Collectors.toList())
            );
        }
        return dto;
    }
}
