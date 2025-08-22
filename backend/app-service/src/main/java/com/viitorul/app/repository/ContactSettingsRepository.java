package com.viitorul.app.repository;

import com.viitorul.app.entity.ContactSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContactSettingsRepository extends JpaRepository<ContactSettings, Long> {
    Optional<ContactSettings> findTopByOrderByIdAsc();
}
