package com.viitorul.app.repository;

import com.viitorul.app.entity.Match;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("""
        SELECT m FROM Match m
        WHERE m.active = true
          AND (m.homeGoals IS NULL OR m.awayGoals IS NULL)
          AND m.date >= CURRENT_DATE
        ORDER BY m.date ASC, m.kickoffTime ASC
        """)
    List<Match> findUpcomingMatches();

    // Paginare + search + filtrare sezon BY ID sau BY LABEL (ambele opționale)
    @Query(value = """
        SELECT m FROM Match m
        LEFT JOIN m.season s
        WHERE m.active = true
          AND m.homeGoals IS NOT NULL
          AND m.awayGoals IS NOT NULL
          AND (:seasonId IS NULL OR (s IS NOT NULL AND s.id = :seasonId))
          AND (:seasonLabel IS NULL OR (s IS NOT NULL AND LOWER(s.label) = LOWER(:seasonLabel)))
          AND (
                :q IS NULL OR :q = '' OR
                LOWER(m.homeTeam.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(m.awayTeam.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(m.location, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(m.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(m.competition.name, '')) LIKE LOWER(CONCAT('%', :q, '%'))
              )
        ORDER BY m.date DESC, m.kickoffTime DESC, m.id DESC
        """,
            countQuery = """
        SELECT COUNT(m) FROM Match m
        LEFT JOIN m.season s
        WHERE m.active = true
          AND m.homeGoals IS NOT NULL
          AND m.awayGoals IS NOT NULL
          AND (:seasonId IS NULL OR (s IS NOT NULL AND s.id = :seasonId))
          AND (:seasonLabel IS NULL OR (s IS NOT NULL AND LOWER(s.label) = LOWER(:seasonLabel)))
          AND (
                :q IS NULL OR :q = '' OR
                LOWER(m.homeTeam.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(m.awayTeam.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(m.location, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(m.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(m.competition.name, '')) LIKE LOWER(CONCAT('%', :q, '%'))
              )
        """)
    Page<Match> searchFinishedMatches(@Param("q") String q,
                                      @Param("seasonId") Long seasonId,
                                      @Param("seasonLabel") String seasonLabel,
                                      Pageable pageable);

    // pentru selectorul de sezoane (doar etichetele)
    @Query("""
        SELECT DISTINCT s.label
        FROM Match m
        JOIN m.season s
        WHERE m.active = true
          AND m.homeGoals IS NOT NULL
          AND m.awayGoals IS NOT NULL
          AND s.label IS NOT NULL
        ORDER BY s.label DESC
        """)
    List<String> findDistinctSeasonLabelsForFinished();
}
