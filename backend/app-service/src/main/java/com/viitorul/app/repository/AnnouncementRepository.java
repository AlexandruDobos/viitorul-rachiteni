package com.viitorul.app.repository;

import com.viitorul.app.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // — existent: dacă mai ai cod care-l folosește, îl păstrăm
    Page<Announcement> findAllByOrderByPublishedAtDesc(Pageable pageable);

    // — existent: căutare pe titlu, fără filtrare pe timp (NU mai e folosit de listarea publică)
    @Query("""
           SELECT a FROM Announcement a
           WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%'))
           ORDER BY a.publishedAt DESC
           """)
    Page<Announcement> searchByTitle(@Param("q") String q, Pageable pageable);

    /* ===== noi: listare DOAR știri deja publicate ===== */

    Page<Announcement> findByPublishedAtLessThanEqualOrderByPublishedAtDesc(
            OffsetDateTime now, Pageable pageable
    );

    @Query("""
           SELECT a FROM Announcement a
           WHERE a.publishedAt <= :now
             AND LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%'))
           ORDER BY a.publishedAt DESC
           """)
    Page<Announcement> searchPublishedByTitle(
            @Param("q") String q,
            @Param("now") OffsetDateTime now,
            Pageable pageable
    );
}
