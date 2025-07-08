package com.viitorul.user.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerMatchStatsDTO {
    private Long id;
    private Long playerId;
    private Long matchId;

    private int minutesPlayed;
    private int goals;
    private int assists;
    private int yellowCards;
    private int redCards;

    private boolean startingPlayer;
    private boolean substitutedIn;
    private boolean substitutedOut;

    private int shirtNumber;
    private double rating;
    private String positionPlayed;
    private String notes;

    private boolean manOfTheMatch;
}

