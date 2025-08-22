package com.viitorul.app.repository;

import com.viitorul.app.entity.Ad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findAllByOrderByPositionAscOrderIndexAsc();
}
