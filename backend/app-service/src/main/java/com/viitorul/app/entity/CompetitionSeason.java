// src/main/java/com/viitorul/app/entity/CompetitionSeason.java
package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "competition_seasons",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_comp_season_label", columnNames = {"competition_id", "label"})
        }
)
@Getter
@Setter
public class CompetitionSeason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ex: "2024/2025"
    @Column(nullable = false)
    private String label;

    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;
}
