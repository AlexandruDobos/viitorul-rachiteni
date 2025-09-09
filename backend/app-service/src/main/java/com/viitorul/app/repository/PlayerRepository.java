package com.viitorul.app.repository;

import com.viitorul.app.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    // doar jucători activi, ordonați după nume
    List<Player> findAllByIsActiveTrueOrderByNameAsc();

    // toți jucătorii, ordonați după nume
    List<Player> findAllByOrderByNameAsc();

    boolean existsByIdAndIsActiveTrue(Long id);
}
