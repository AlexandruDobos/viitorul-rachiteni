package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_player_stat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchPlayerStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    private int goals;
    private int assists;
    private int yellowCards;
    private boolean redCard;
}
