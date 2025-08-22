// src/main/java/com/viitorul/app/entity/Competition.java
package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "competitions")
@Getter
@Setter
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private boolean active = true;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<CompetitionSeason> seasons;
}
