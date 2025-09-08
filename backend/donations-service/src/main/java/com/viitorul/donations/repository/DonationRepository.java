package com.viitorul.donations.repository;

import com.viitorul.donations.domain.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    Optional<Donation> findByStripeSessionId(String stripeSessionId);
}
