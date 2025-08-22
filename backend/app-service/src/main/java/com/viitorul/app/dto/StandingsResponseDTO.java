package com.viitorul.app.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandingsResponseDTO {
    private String sourceUrl;
    private Boolean scheduleEnabled;
    private OffsetDateTime lastUpdated;
    private List<StandingsRowDTO> rows;
}
