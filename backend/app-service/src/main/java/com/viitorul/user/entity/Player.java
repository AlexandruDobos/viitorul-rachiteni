package com.viitorul.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String position;
    private Integer shirtNumber;
    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

}
