package com.viitorul.user.repository;

import com.viitorul.user.entity.PlayerMatchStats;
import com.viitorul.user.entity.Match;
import com.viitorul.user.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerMatchStatsRepository extends JpaRepository<PlayerMatchStats, Long> {
    List<PlayerMatchStats> findByPlayer(Player player);
    List<PlayerMatchStats> findByMatch(Match match);
    List<PlayerMatchStats> findByPlayerAndMatch(Player player, Match match);
}
