package com.viitorul.app.repository;

import com.viitorul.app.entity.MatchPlayerStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchPlayerStatRepository extends JpaRepository<MatchPlayerStat, Long> {
    List<MatchPlayerStat> findByPlayer_Id(Long playerId);
    Optional<MatchPlayerStat> findByMatch_IdAndPlayer_Id(Long matchId, Long playerId);
    List<MatchPlayerStat> findByMatch_Id(Long matchId);
}
