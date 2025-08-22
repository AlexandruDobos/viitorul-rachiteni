package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "ads")
public class Ad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
    private String link;

    @Column(nullable = false)
    private String position; // left, right, top, bottom

    private Integer orderIndex;

    private LocalDate startDate;
    private LocalDate endDate;

}
