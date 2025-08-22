package com.viitorul.app.repository;

import com.viitorul.app.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByActiveTrue();
}
