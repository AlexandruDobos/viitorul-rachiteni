package com.viitorul.app.dto;

import com.viitorul.app.entity.StandingsRow;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandingsRowDTO {
    private Integer rank;
    private String teamName;
    private String teamUrl;
    private Integer played;
    private Integer wins;
    private Integer draws;
    private Integer losses;
    private Integer goalsFor;
    private Integer goalsAgainst;
    private Integer points;

    public static StandingsRowDTO toDto(StandingsRow e) {
        return StandingsRowDTO.builder()
                .rank(e.getRank())
                .teamName(e.getTeamName())
                .teamUrl(e.getTeamUrl())
                .played(e.getPlayed())
                .wins(e.getWins())
                .draws(e.getDraws())
                .losses(e.getLosses())
                .goalsFor(e.getGoalsFor())
                .goalsAgainst(e.getGoalsAgainst())
                .points(e.getPoints())
                .build();
    }
}
