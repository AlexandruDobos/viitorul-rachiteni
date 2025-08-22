package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_mvp_vote",
        uniqueConstraints = @UniqueConstraint(name="uq_mvp_vote", columnNames={"match_id","user_email"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchMvpVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="match_id", nullable=false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="player_id", nullable=false)
    private Player player;

    @Column(name="user_email", nullable=false)
    private String userEmail;

    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at", nullable=false) private LocalDateTime updatedAt;

    @PrePersist void prePersist(){ createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void preUpdate(){ updatedAt = LocalDateTime.now(); }
}
