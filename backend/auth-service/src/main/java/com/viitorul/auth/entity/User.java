package com.viitorul.auth.entity;

import com.viitorul.auth.entity.enums.AuthProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider; // GOOGLE, FACEBOOK, LOCAL

    private String providerId;

    private LocalDateTime registeredAt;
    private LocalDateTime lastLoginAt;
}
