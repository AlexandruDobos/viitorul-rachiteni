package com.viitorul.app.repository;

import com.viitorul.app.entity.Ad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {

    // pt. listare în UI (filtrat pe device)
    List<Ad> findAllByDeviceOrderByPositionAscOrderIndexAsc(String device);

    // pt. reindexare într-un "grup" (position + device)
    List<Ad> findAllByPositionAndDeviceOrderByOrderIndexAsc(String position, String device);
}
