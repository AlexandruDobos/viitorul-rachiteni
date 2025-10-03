package com.viitorul.app.repository;

import com.viitorul.app.entity.MatchPlayerStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchPlayerStatRepository extends JpaRepository<MatchPlayerStat, Long> {

    List<MatchPlayerStat> findByPlayer_Id(Long playerId);
    Optional<MatchPlayerStat> findByMatch_IdAndPlayer_Id(Long matchId, Long playerId);
    List<MatchPlayerStat> findByMatch_Id(Long matchId);

    @Query("""
        SELECT s FROM MatchPlayerStat s
        JOIN s.match m
        WHERE s.player.id = :playerId
          AND (:seasonId IS NULL OR (m.season IS NOT NULL AND m.season.id = :seasonId))
        ORDER BY m.date DESC, m.kickoffTime DESC, m.id DESC
        """)
    List<MatchPlayerStat> findForPlayerFilteredAndSorted(
            @Param("playerId") Long playerId,
            @Param("seasonId") Long seasonId
    );
}
