package com.viitorul.app.repository;

import com.viitorul.app.entity.StandingsRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;

public interface StandingsRowRepository extends JpaRepository<StandingsRow, Long> {

    @Query("""
       SELECT sr FROM StandingsRow sr
       WHERE sr.snapshotAt = (SELECT MAX(s2.snapshotAt) FROM StandingsRow s2)
       ORDER BY sr.rank ASC NULLS LAST
    """)
    List<StandingsRow> findLatestSnapshot();

    @Query("SELECT MAX(sr.snapshotAt) FROM StandingsRow sr")
    OffsetDateTime findMaxSnapshotAt();
}
