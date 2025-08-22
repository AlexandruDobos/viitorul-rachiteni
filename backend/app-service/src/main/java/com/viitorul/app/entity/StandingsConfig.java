package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "standings_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandingsConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(nullable = false)
    private boolean scheduleEnabled;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;
}
