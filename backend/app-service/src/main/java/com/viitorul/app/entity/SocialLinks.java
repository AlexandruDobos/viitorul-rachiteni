package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "social_links")
public class SocialLinks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String facebookUrl;

    @Column(columnDefinition = "TEXT")
    private String instagramUrl;

    @Column(columnDefinition = "TEXT")
    private String youtubeUrl;
}
