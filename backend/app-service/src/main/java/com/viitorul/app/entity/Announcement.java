package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false) // Frontend trimite ISO (UTC) -> OffsetDateTime
    private OffsetDateTime publishedAt;

    @Column(columnDefinition = "TEXT")
    private String coverUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentHtml;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentText;
}
