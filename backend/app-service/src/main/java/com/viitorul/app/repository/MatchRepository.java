package com.viitorul.app.repository;

import com.viitorul.app.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    @Query("SELECT m FROM Match m WHERE m.homeGoals IS NULL OR m.awayGoals IS NULL ORDER BY m.date ASC")
    List<Match> findUpcomingMatches();
}
