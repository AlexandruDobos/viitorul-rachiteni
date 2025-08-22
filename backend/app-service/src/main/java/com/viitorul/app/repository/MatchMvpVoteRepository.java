package com.viitorul.app.repository;

import com.viitorul.app.entity.MatchMvpVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchMvpVoteRepository extends JpaRepository<MatchMvpVote, Long> {
    Optional<MatchMvpVote> findByMatchIdAndUserEmail(Long matchId, String email);

    @Query("""
     SELECT v.player.id, COUNT(v)
       FROM MatchMvpVote v
      WHERE v.match.id = :matchId
      GROUP BY v.player.id
  """)
    List<Object[]> countByPlayer(@Param("matchId") Long matchId);

    long countByMatchId(Long matchId);
}
