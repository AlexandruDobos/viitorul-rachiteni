package com.viitorul.user.repository;

import com.viitorul.user.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    // Poți adăuga metode custom, ex:
    // List<Match> findBySeason(String season);
}
