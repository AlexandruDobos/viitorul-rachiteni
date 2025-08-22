package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "standings_row")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandingsRow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rank;

    @Column(nullable = false)
    private String teamName;

    private String teamUrl;

    private Integer played;
    private Integer wins;
    private Integer draws;
    private Integer losses;

    private Integer goalsFor;
    private Integer goalsAgainst;

    private Integer points;

    @Column(nullable = false)
    private OffsetDateTime snapshotAt;
}
