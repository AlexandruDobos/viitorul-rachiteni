package com.viitorul.app.repository;

import com.viitorul.app.entity.SocialLinks;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialLinksRepository extends JpaRepository<SocialLinks, Long> {
    Optional<SocialLinks> findFirstByOrderByIdAsc();
}
