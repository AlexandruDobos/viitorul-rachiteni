package com.viitorul.app.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandingsSaveRequestDTO {
    @NotNull
    private String sourceUrl;
    @NotNull
    private List<StandingsRowDTO> rows;
}
