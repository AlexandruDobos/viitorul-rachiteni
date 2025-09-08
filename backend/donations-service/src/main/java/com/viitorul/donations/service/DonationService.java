package com.viitorul.donations.service;

import com.stripe.model.checkout.Session;
import com.viitorul.donations.domain.Donation;
import com.viitorul.donations.domain.DonationStatus;
import com.viitorul.donations.repository.DonationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class DonationService {

    private final DonationRepository repo;

    public DonationService(DonationRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void recordCreatedSession(Session session, Long intendedAmountMinor, String currency,
                                     String donorEmail, String donorName, String donorMessage) {
        // creează doar dacă nu există (în caz de retry client)
        repo.findByStripeSessionId(session.getId()).ifPresentOrElse(d -> {}, () -> {
            Donation d = new Donation();
            d.setStripeSessionId(session.getId());
            d.setPaymentIntentId(session.getPaymentIntent()); // poate fi null la început
            d.setStatus(DonationStatus.CREATED);
            d.setIntendedAmount(intendedAmountMinor);
            d.setCurrency(currency);
            d.setDonorEmail(donorEmail);
            d.setDonorName(donorName);
            d.setDonorMessage(donorMessage);
            repo.save(d);
        });
    }

    @Transactional
    public void markPaidFromSession(Session session) {
        Donation d = repo.findByStripeSessionId(session.getId()).orElseGet(() -> {
            // dacă nu exista (ex. server down la /checkout), o creăm din webhook
            Donation nd = new Donation();
            nd.setStripeSessionId(session.getId());
            nd.setPaymentIntentId(session.getPaymentIntent());
            nd.setStatus(DonationStatus.CREATED);
            nd.setCurrency(session.getCurrency());
            nd.setDonorEmail(session.getCustomerEmail());
            if (session.getMetadata() != null) {
                nd.setDonorName(session.getMetadata().get("donor_name"));
                nd.setDonorMessage(session.getMetadata().get("message"));
            }
            return repo.save(nd);
        });

        // idempotent: dacă e deja PAID, ieșim
        if (d.getStatus() == DonationStatus.PAID) return;

        d.setPaymentIntentId(session.getPaymentIntent());
        d.setFinalAmount(session.getAmountTotal());
        d.setCurrency(session.getCurrency());
        if (d.getDonorEmail() == null) d.setDonorEmail(session.getCustomerEmail());
        if (session.getMetadata() != null) {
            if (d.getDonorName() == null) d.setDonorName(session.getMetadata().get("donor_name"));
            if (d.getDonorMessage() == null) d.setDonorMessage(session.getMetadata().get("message"));
        }
        d.setStatus(DonationStatus.PAID);
        d.setPaidAt(OffsetDateTime.now());
        // @Transactional + dirty checking => update automat
    }
}
