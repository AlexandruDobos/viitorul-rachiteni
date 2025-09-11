package com.viitorul.app.repository;

import com.viitorul.app.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    Page<Announcement> findAllByOrderByPublishedAtDesc(Pageable pageable);

    // Căutare strict pe titlu (case-insensitive) + sort desc după publishedAt
    @Query("""
           SELECT a FROM Announcement a
           WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%'))
           ORDER BY a.publishedAt DESC
           """)
    Page<Announcement> searchByTitle(@Param("q") String q, Pageable pageable);
}
