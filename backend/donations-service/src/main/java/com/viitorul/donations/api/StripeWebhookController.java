package com.viitorul.donations.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.viitorul.common.events.DonationCompletedEvent;
import com.viitorul.donations.messaging.DonationEventsPublisher;
import com.viitorul.donations.service.DonationService;   // 👈 ADĂUGAT
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donations")
public class StripeWebhookController {

    private final String webhookSecret;
    private final ObjectMapper mapper = new ObjectMapper();
    private final DonationEventsPublisher publisher;
    private final DonationService donationService; // 👈 ADĂUGAT

    public StripeWebhookController(
            @Value("${stripe.webhook-secret}") String webhookSecret,
            DonationEventsPublisher publisher,
            DonationService donationService  // 👈 ADĂUGAT
    ) {
        this.webhookSecret = webhookSecret;
        this.publisher = publisher;
        this.donationService = donationService;
    }

    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handle(@RequestBody String payload,
                                         @RequestHeader("Stripe-Signature") String sigHeader) {
        final Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            try {
                JsonNode root = mapper.readTree(payload);
                String sessionId = root.path("data").path("object").path("id").asText(null);

                if (sessionId != null && !sessionId.isBlank()) {
                    Session session = Session.retrieve(sessionId);
                    if ("subscription".equalsIgnoreCase(session.getMode()) || session.getSubscription() != null) {
                        return ResponseEntity.ok("ignored_subscription");
                    }
                    if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                        // 1) persistă în DB (idempotent)
                        donationService.markPaidFromSession(session);

                        // 2) trimite evenimentul pentru email
                        String donorName = session.getMetadata() != null ? session.getMetadata().get("donor_name") : null;
                        String msg = session.getMetadata() != null ? session.getMetadata().get("message") : null;

                        DonationCompletedEvent evt = new DonationCompletedEvent(
                                session.getId(),
                                session.getAmountTotal(),
                                session.getCurrency(),
                                session.getCustomerEmail(),
                                donorName,
                                msg
                        );
                        publisher.publishDonationCompleted(evt);
                    }
                }
            } catch (Exception ex) {
                return ResponseEntity.ok("ignored");
            }
        }

        return ResponseEntity.ok("ok");
    }
}
