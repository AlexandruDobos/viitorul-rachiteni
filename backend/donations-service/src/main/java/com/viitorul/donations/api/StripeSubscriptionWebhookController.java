// com/viitorul/donations/api/StripeSubscriptionWebhookController.java
package com.viitorul.donations.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.viitorul.common.events.SubscriptionPaymentCompletedEvent;
import com.viitorul.donations.messaging.SubscriptionEventsPublisher;
import com.viitorul.donations.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donations/subscriptions")
public class StripeSubscriptionWebhookController {

    private final String webhookSecret;
    private final ObjectMapper mapper = new ObjectMapper();
    private final SubscriptionService subscriptionService;
    private final SubscriptionEventsPublisher publisher;

    public StripeSubscriptionWebhookController(
            @Value("${stripe.subscriptions-webhook-secret}") String webhookSecret,
            SubscriptionService subscriptionService,
            SubscriptionEventsPublisher publisher) {
        this.webhookSecret = webhookSecret;
        this.subscriptionService = subscriptionService;
        this.publisher = publisher;
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

        try {
            switch (event.getType()) {
                case "checkout.session.completed" -> {
                    // Pentru SUBSCRIPTION mode
                    JsonNode root = mapper.readTree(payload);
                    String sessionId = root.path("data").path("object").path("id").asText(null);
                    if (sessionId != null) {
                        Session session = Session.retrieve(sessionId);
                        if ("subscription".equalsIgnoreCase(session.getMode())) {
                            subscriptionService.upsertFromCheckoutSession(session);
                        }
                    }
                }
                case "invoice.paid" -> {
                    // Tranzacție recurentă reușită
                    JsonNode root = mapper.readTree(payload);
                    String invoiceId = root.path("data").path("object").path("id").asText(null);
                    if (invoiceId != null) {
                        Invoice invoice = Invoice.retrieve(invoiceId);
                        subscriptionService.recordInvoicePaid(invoice);

                        // Trimitem eveniment pentru mail (mulțumire)
                        String subId = invoice.getSubscription();
                        var amount = invoice.getAmountPaid();
                        var currency = invoice.getCurrency();

                        // Recuperăm info client (email/nume) din invoice/customer_email sau din ultima sesiune (dacă o ai salvat)
                        String email = invoice.getCustomerEmail(); // Stripe poate popula
                        // Numele și mesajul sunt disponibile în metadata ultimului checkout; dacă vrei, poți să le copiezi în Subscription și să le pui aici
                        String name = null;   // dacă ai salvat în entitate
                        String msg  = null;

                        var evt = new SubscriptionPaymentCompletedEvent(
                                subId,
                                invoiceId,
                                amount,
                                currency,
                                email,
                                name,
                                msg
                        );
                        publisher.publishPayment(evt);
                    }
                }
                case "customer.subscription.deleted" -> {
                    JsonNode root = mapper.readTree(payload);
                    String stripeSubId = root.path("data").path("object").path("id").asText(null);
                    if (stripeSubId != null) {
                        subscriptionService.markCanceled(stripeSubId);
                    }
                }
                default -> {
                    // ignore the rest or add more handlers (invoice.payment_failed etc.)
                }
            }
        } catch (Exception ex) {
            // Nu întoarce 500, Stripe va re-trimite evenimentul
            return ResponseEntity.ok("ignored");
        }

        return ResponseEntity.ok("ok");
    }
}
