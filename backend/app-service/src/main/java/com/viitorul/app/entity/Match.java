// com/viitorul/app/entity/Match.java
package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "match")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "home_team_id")
    private Team homeTeam;

    @ManyToOne(optional = false)
    @JoinColumn(name = "away_team_id")
    private Team awayTeam;

    private LocalDate date;
    private LocalTime kickoffTime;
    private String location;

    // NEW: legături către Competition și CompetitionSeason
    @ManyToOne
    @JoinColumn(name = "competition_id")
    private Competition competition;

    @ManyToOne
    @JoinColumn(name = "season_id")
    private CompetitionSeason season;

    private Integer homeGoals;
    private Integer awayGoals;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String matchReportUrl;

    @ManyToMany
    @JoinTable(
            name = "match_starting_players",
            joinColumns = @JoinColumn(name = "match_id"),
            inverseJoinColumns = @JoinColumn(name = "player_id")
    )
    private List<Player> startingPlayers;

    @ManyToMany
    @JoinTable(
            name = "match_substitute_players",
            joinColumns = @JoinColumn(name = "match_id"),
            inverseJoinColumns = @JoinColumn(name = "player_id")
    )
    private List<Player> substitutePlayers;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL)
    private List<MatchPlayerStat> playerStats;

    @Column(nullable = false)
    private boolean active = true;
}
