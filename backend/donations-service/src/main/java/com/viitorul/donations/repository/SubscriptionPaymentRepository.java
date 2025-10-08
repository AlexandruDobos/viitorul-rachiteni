package com.viitorul.donations.repository;

import com.viitorul.donations.domain.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {
    Optional<SubscriptionPayment> findByStripeInvoiceId(String invoiceId);
}