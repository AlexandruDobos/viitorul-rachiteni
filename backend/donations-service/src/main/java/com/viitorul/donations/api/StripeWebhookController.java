package com.viitorul.donations.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donations")
public class StripeWebhookController {

    private final String webhookSecret;
    private final ObjectMapper mapper = new ObjectMapper();

    public StripeWebhookController(@Value("${stripe.webhook-secret}") String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handle(@RequestBody String payload,
                                         @RequestHeader("Stripe-Signature") String sigHeader) {
        // 1) Verifică semnătura Stripe (obligatoriu)
        final Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // 2) Procesează evenimentele care te interesează
        if ("checkout.session.completed".equals(event.getType())) {
            try {
                // 2a) Extrage id-ul sesiunii din payload: data.object.id
                JsonNode root = mapper.readTree(payload);
                String sessionId = root.path("data").path("object").path("id").asText(null);

                if (sessionId != null && !sessionId.isBlank()) {
                    // 2b) Ia obiectul canonic de la Stripe
                    Session session = Session.retrieve(sessionId);

                    // AICI ai datele sigure după plată:
                    // session.getId(), session.getAmountTotal(), session.getCurrency(), session.getCustomerEmail() etc.
                    // TODO: marchează donația ca "paid" în DB (dacă vrei evidență) și/sau apelează email-service pentru "mulțumim".
                }
            } catch (Exception ex) {
                // nu dezvălui detalii sensibile în răspuns
                return ResponseEntity.ok("ignored");
            }
        }

        return ResponseEntity.ok("ok");
    }
}
