package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contact_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Stocăm lista de emailuri într-o tabelă separată (clean & queryable)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "contact_settings_emails",
            joinColumns = @JoinColumn(name = "settings_id")
    )
    @Column(name = "email", nullable = false, length = 255)
    private List<String> destinationEmails = new ArrayList<>();
}
