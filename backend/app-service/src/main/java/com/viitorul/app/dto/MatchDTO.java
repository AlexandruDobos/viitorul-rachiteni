// com/viitorul/app/dto/MatchDTO.java
package com.viitorul.app.dto;

import com.viitorul.app.entity.Match;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDTO {
    private Long id;

    private Long homeTeamId;
    private Long awayTeamId;
    private String homeTeamName;
    private String awayTeamName;
    private String homeTeamLogo;
    private String awayTeamLogo;

    private LocalDate date;
    private LocalTime kickoffTime;
    private String location;

    // NEW:
    private Long competitionId;
    private String competitionName;

    private Long seasonId;
    private String seasonLabel;

    private Integer homeGoals;
    private Integer awayGoals;
    private String notes;
    private String matchReportUrl;

    private List<Long> startingPlayerIds;
    private List<Long> substitutePlayerIds;
    private boolean active;

    public static MatchDTO toDto(Match match) {
        return MatchDTO.builder()
                .id(match.getId())
                .homeTeamId(match.getHomeTeam().getId())
                .awayTeamId(match.getAwayTeam().getId())
                .homeTeamName(match.getHomeTeam().getName())
                .awayTeamName(match.getAwayTeam().getName())
                .homeTeamLogo(match.getHomeTeam().getLogo())
                .awayTeamLogo(match.getAwayTeam().getLogo())
                .date(match.getDate())
                .kickoffTime(match.getKickoffTime())
                .location(match.getLocation())
                .competitionId(match.getCompetition() != null ? match.getCompetition().getId() : null)
                .competitionName(match.getCompetition() != null ? match.getCompetition().getName() : null)
                .seasonId(match.getSeason() != null ? match.getSeason().getId() : null)
                .seasonLabel(match.getSeason() != null ? match.getSeason().getLabel() : null)
                .homeGoals(match.getHomeGoals())
                .awayGoals(match.getAwayGoals())
                .notes(match.getNotes())
                .matchReportUrl(match.getMatchReportUrl())
                .startingPlayerIds(match.getStartingPlayers() != null
                        ? match.getStartingPlayers().stream().map(p -> p.getId()).toList() : List.of())
                .substitutePlayerIds(match.getSubstitutePlayers() != null
                        ? match.getSubstitutePlayers().stream().map(p -> p.getId()).toList() : List.of())
                .active(match.isActive())
                .build();
    }
}
