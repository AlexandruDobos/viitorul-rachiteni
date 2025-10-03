package com.viitorul.app.dto;

import com.viitorul.app.entity.Match;
import com.viitorul.app.entity.MatchPlayerStat;
import com.viitorul.app.entity.Player;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchPlayerStatDTO {
    private Long playerId;
    private Long matchId;
    private int goals;
    private int assists;
    private int yellowCards;
    private boolean redCard;
    private String matchName;

    private String playerName;
    private Integer shirtNumber;
    private String playerProfileImageUrl;
    private Boolean playerActive;

    private LocalDate matchDate;
    private LocalTime matchKickoffTime;
    private Long seasonId;
    private String seasonLabel;

    public static MatchPlayerStatDTO toDto(MatchPlayerStat stat) {
        Match match = stat.getMatch();
        Player p = stat.getPlayer();
        String matchName = match.getHomeTeam().getName() + " - " + match.getAwayTeam().getName();

        return MatchPlayerStatDTO.builder()
                .playerId(p.getId())
                .matchId(match.getId())
                .goals(stat.getGoals())
                .assists(stat.getAssists())
                .yellowCards(stat.getYellowCards())
                .redCard(stat.isRedCard())
                .matchName(matchName)
                .playerName(p.getName())
                .shirtNumber(p.getShirtNumber())
                .playerProfileImageUrl(p.getProfileImageUrl())
                .playerActive(Boolean.TRUE.equals(p.getIsActive()))
                .matchDate(match.getDate())
                .matchKickoffTime(match.getKickoffTime())
                .seasonId(match.getSeason() != null ? match.getSeason().getId() : null)
                .seasonLabel(match.getSeason() != null ? match.getSeason().getLabel() : null)
                .build();
    }

    public MatchPlayerStat toEntity(Match match, Player player) {
        return MatchPlayerStat.builder()
                .match(match)
                .player(player)
                .goals(goals)
                .assists(assists)
                .yellowCards(yellowCards)
                .redCard(redCard)
                .build();
    }
}
