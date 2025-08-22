package com.viitorul.app.dto;

import com.viitorul.app.entity.Match;
import com.viitorul.app.entity.MatchPlayerStat;
import com.viitorul.app.entity.Player;
import lombok.*;

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

    public static MatchPlayerStatDTO toDto(MatchPlayerStat stat) {
        Match match = stat.getMatch();
        String matchName = match.getHomeTeam().getName() + " - " + match.getAwayTeam().getName();

        return MatchPlayerStatDTO.builder()
                .playerId(stat.getPlayer().getId())
                .matchId(match.getId())
                .goals(stat.getGoals())
                .assists(stat.getAssists())
                .yellowCards(stat.getYellowCards())
                .redCard(stat.isRedCard())
                .matchName(matchName)
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
