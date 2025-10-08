package com.viitorul.donations.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "subscriptions", indexes = {
        @Index(name = "idx_subscriptions_created_at", columnList = "created_at DESC"),
        @Index(name = "idx_subscriptions_customer", columnList = "stripe_customer_id"),
        @Index(name = "idx_subscriptions_subscription", columnList = "stripe_subscription_id")
})
public class Subscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stripe_subscription_id", unique = true, length = 255)
    private String stripeSubscriptionId; // ex: sub_...

    @Column(name = "stripe_customer_id", length = 255)
    private String stripeCustomerId; // ex: cus_...

    @Column(name = "stripe_price_id", length = 255)
    private String stripePriceId; // ex: price_...

    @Column(name = "plan_code", length = 64)
    private String planCode; // ron_50 etc

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private SubscriptionStatus status;

    @Column(name = "supporter_email", length = 320)
    private String supporterEmail;

    @Column(name = "supporter_name", length = 255)
    private String supporterName;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @PrePersist
    public void prePersist() {
        var now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = SubscriptionStatus.CREATED;
    }
    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }
}
