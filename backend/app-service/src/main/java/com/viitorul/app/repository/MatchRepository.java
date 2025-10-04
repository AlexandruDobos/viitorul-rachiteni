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
     * Căutare fără diacritice doar pe numele echipelor + filtrare sezon (ID sau LABEL), ambele opționale.
     * IMPORTANT: forțăm CAST(... AS string) pe parametri înainte de unaccent() ca să evităm unaccent(bytea).
     */
    @Query(value = """
            SELECT m FROM Match m
            LEFT JOIN m.season s
            JOIN m.homeTeam ht
            JOIN m.awayTeam at
            WHERE m.active = true
              AND m.homeGoals IS NOT NULL
              AND m.awayGoals IS NOT NULL
              AND (:seasonId IS NULL OR (s IS NOT NULL AND s.id = :seasonId))
              AND (
                   :seasonLabel IS NULL OR
                   LOWER(FUNCTION('unaccent', COALESCE(s.label,'')))
                     = LOWER(FUNCTION('unaccent', CAST(:seasonLabel AS string)))
              )
              AND (
                    :q IS NULL OR :q = '' OR
                    LOWER(FUNCTION('unaccent', ht.name)) LIKE
                      CONCAT('%', LOWER(FUNCTION('unaccent', CAST(:q AS string))), '%')
                    OR
                    LOWER(FUNCTION('unaccent', at.name)) LIKE
                      CONCAT('%', LOWER(FUNCTION('unaccent', CAST(:q AS string))), '%')
                  )
            ORDER BY m.date DESC, m.kickoffTime DESC, m.id DESC
            """,
            countQuery = """
                    SELECT COUNT(m) FROM Match m
                    LEFT JOIN m.season s
                    JOIN m.homeTeam ht
                    JOIN m.awayTeam at
                    WHERE m.active = true
                      AND m.homeGoals IS NOT NULL
                      AND m.awayGoals IS NOT NULL
                      AND (:seasonId IS NULL OR (s IS NOT NULL AND s.id = :seasonId))
                      AND (
                           :seasonLabel IS NULL OR
                           LOWER(FUNCTION('unaccent', COALESCE(s.label,'')))
                             = LOWER(FUNCTION('unaccent', CAST(:seasonLabel AS string)))
                      )
                      AND (
                            :q IS NULL OR :q = '' OR
                            LOWER(FUNCTION('unaccent', ht.name)) LIKE
                              CONCAT('%', LOWER(FUNCTION('unaccent', CAST(:q AS string))), '%')
                            OR
                            LOWER(FUNCTION('unaccent', at.name)) LIKE
                              CONCAT('%', LOWER(FUNCTION('unaccent', CAST(:q AS string))), '%')
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

    Page<Match> findAllByActiveTrueOrderByDateDesc(Pageable pageable);

    @Query("""
            SELECT m FROM Match m
            LEFT JOIN m.homeTeam ht
            LEFT JOIN m.awayTeam at
            WHERE m.active = true
              AND (
                :q IS NULL OR :q = '' OR
                LOWER(FUNCTION('unaccent', COALESCE(ht.name, ''))) LIKE
                  CONCAT('%', LOWER(FUNCTION('unaccent', CAST(:q AS string))), '%')
                OR
                LOWER(FUNCTION('unaccent', COALESCE(at.name, ''))) LIKE
                  CONCAT('%', LOWER(FUNCTION('unaccent', CAST(:q AS string))), '%')
              )
            ORDER BY m.date DESC, m.kickoffTime DESC, m.id DESC
            """)
    Page<Match> searchAllByTeamNames(@Param("q") String q, Pageable pageable);
}
