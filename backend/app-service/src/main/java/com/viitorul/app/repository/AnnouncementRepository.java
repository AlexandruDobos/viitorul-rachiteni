// backend: src/main/java/com/viitorul/app/repository/AnnouncementRepository.java
package com.viitorul.app.repository;

import com.viitorul.app.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    Page<Announcement> findAllByOrderByPublishedAtDesc(Pageable pageable);

    Page<Announcement> findByTitleContainingIgnoreCaseOrderByPublishedAtDesc(String title, Pageable pageable);
}
