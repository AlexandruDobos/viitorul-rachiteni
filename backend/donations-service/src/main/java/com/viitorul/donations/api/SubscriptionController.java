package com.viitorul.donations.api;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.viitorul.donations.config.SubscriptionsProperties;
import com.viitorul.donations.dto.CreateSubscriptionRequest;
import com.viitorul.donations.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donations/subscriptions")
public class SubscriptionController {

    private final SubscriptionsProperties props;
    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionsProperties props,
                                  SubscriptionService subscriptionService) {
        this.props = props;
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String,String>> createCheckout(@Valid @RequestBody CreateSubscriptionRequest req) throws Exception {
        String priceId = props.getPrices() != null ? props.getPrices().get(req.getPlanCode()) : null;
        if (priceId == null || priceId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error","Plan invalid"));
        }

        var item = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPrice(priceId)
                .build();

        var builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(props.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(props.getCancelUrl())
                .addLineItem(item)
                .putMetadata("donor_name", req.getSupporterName() == null ? "" : req.getSupporterName())
                .putMetadata("message", req.getMessage() == null ? "" : req.getMessage());

        if (req.getSupporterEmail() != null && !req.getSupporterEmail().isBlank()) {
            builder.setCustomerEmail(req.getSupporterEmail());
        }

        Session session = Session.create(builder.build());

        // la subscription, persistăm minim customer/email – detaliile complete după webhook
        subscriptionService.upsertFromCheckoutSession(session);

        return ResponseEntity.ok(Map.of("id", session.getId(), "url", session.getUrl()));
    }
}
