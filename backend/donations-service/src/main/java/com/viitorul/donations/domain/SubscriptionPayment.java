package com.viitorul.donations.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "subscription_payments", indexes = {
        @Index(name = "idx_sub_payments_created_at", columnList = "created_at DESC"),
        @Index(name = "idx_sub_payments_subscription", columnList = "subscription_id"),
        @Index(name = "idx_sub_payments_invoice", columnList = "stripe_invoice_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_sub_payments_invoice", columnNames = "stripe_invoice_id")
})
public class SubscriptionPayment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_sub_payment_subscription"))
    private Subscription subscription;

    @Column(name = "stripe_invoice_id", nullable = false, unique = true, length = 255)
    private String stripeInvoiceId; // in_...

    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId; // pi_...

    @Column(name = "amount_paid")
    private Long amountPaid; // minor units

    @Column(length = 12)
    private String currency; // "ron", "eur" (stripe trimite lowercase ISO—ex: "ron","eur")

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
