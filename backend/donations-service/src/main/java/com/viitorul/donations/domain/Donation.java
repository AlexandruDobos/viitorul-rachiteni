package com.viitorul.donations.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "donations", indexes = {
        @Index(name = "idx_donations_created_at", columnList = "created_at DESC")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_donations_session", columnNames = "stripe_session_id")
})
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stripe_session_id", nullable = false, unique = true, length = 255)
    private String stripeSessionId;

    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private DonationStatus status;

    @Column(name = "intended_amount")
    private Long intendedAmount;

    @Column(name = "final_amount")
    private Long finalAmount;

    @Column(length = 12)
    private String currency;

    @Column(name = "donor_email", length = 320)
    private String donorEmail;

    @Column(name = "donor_name", length = 255)
    private String donorName;

    @Column(name = "donor_message")
    private String donorMessage;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    /* getters & setters */

    @PrePersist
    public void prePersist() {
        var now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = DonationStatus.CREATED;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

}
