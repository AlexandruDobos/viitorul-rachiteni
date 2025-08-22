// src/main/java/com/viitorul/app/repository/CompetitionRepository.java
package com.viitorul.app.repository;

import com.viitorul.app.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    List<Competition> findByActiveTrue();
}
