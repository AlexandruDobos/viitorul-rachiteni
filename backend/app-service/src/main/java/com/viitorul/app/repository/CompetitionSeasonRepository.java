// src/main/java/com/viitorul/app/repository/CompetitionSeasonRepository.java
package com.viitorul.app.repository;

import com.viitorul.app.entity.CompetitionSeason;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompetitionSeasonRepository extends JpaRepository<CompetitionSeason, Long> {
    List<CompetitionSeason> findByCompetitionIdAndActiveTrue(Long competitionId);
    Optional<CompetitionSeason> findByIdAndCompetitionId(Long id, Long competitionId);
}
