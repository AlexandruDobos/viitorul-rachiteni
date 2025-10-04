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

    /**
     * Paginare + search fără diacritice + filtrare sezon (ID sau LABEL), ambele opționale.
     * Necesită extensia Postgres `unaccent`.
     */
    @Query(value = """
        SELECT m FROM Match m
        LEFT JOIN m.season s
        WHERE m.active = true
          AND m.homeGoals IS NOT NULL
          AND m.awayGoals IS NOT NULL
          AND (:seasonId IS NULL OR (s IS NOT NULL AND s.id = :seasonId))
          AND (:seasonLabel IS NULL OR (s IS NOT NULL AND
               LOWER(FUNCTION('unaccent', s.label)) = LOWER(FUNCTION('unaccent', :seasonLabel))))
          AND (
                :q IS NULL OR :q = '' OR
                LOWER(FUNCTION('unaccent', m.homeTeam.name))        LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', m.awayTeam.name))        LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', COALESCE(m.location,''))) LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', COALESCE(m.notes,'')))    LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', COALESCE(m.competition.name,'')))
                    LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%')))
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
          AND (:seasonLabel IS NULL OR (s IS NOT NULL AND
               LOWER(FUNCTION('unaccent', s.label)) = LOWER(FUNCTION('unaccent', :seasonLabel))))
          AND (
                :q IS NULL OR :q = '' OR
                LOWER(FUNCTION('unaccent', m.homeTeam.name))        LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', m.awayTeam.name))        LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', COALESCE(m.location,''))) LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', COALESCE(m.notes,'')))    LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%'))) OR
                LOWER(FUNCTION('unaccent', COALESCE(m.competition.name,'')))
                    LIKE LOWER(FUNCTION('unaccent', CONCAT('%', :q, '%')))
              )
        """)
    Page<Match> searchFinishedMatches(@Param("q") String q,
                                      @Param("seasonId") Long seasonId,
                                      @Param("seasonLabel") String seasonLabel,
                                      Pageable pageable);

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
