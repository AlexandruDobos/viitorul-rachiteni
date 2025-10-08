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

    @GetMapping("/session/{id}")
    public ResponseEntity<Map<String, Object>> getSubscriptionSession(@PathVariable("id") String id) throws Exception {
        Session s = Session.retrieve(id);
        if (!"subscription".equalsIgnoreCase(s.getMode())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Not a subscription session"));
        }

        // Luăm subscripția pentru interval/price
        String subId = s.getSubscription();
        var out = new java.util.HashMap<String, Object>();
        out.put("id", s.getId());
        out.put("status", s.getPaymentStatus());
        out.put("amount", s.getAmountTotal());        // prima plată (minor units)
        out.put("currency", s.getCurrency());

        if (subId != null) {
            com.stripe.model.Subscription sub = com.stripe.model.Subscription.retrieve(subId);
            // încercăm să citim intervalul din primul item
            String interval = null;
            if (sub.getItems() != null &&
                    sub.getItems().getData() != null &&
                    !sub.getItems().getData().isEmpty() &&
                    sub.getItems().getData().get(0).getPrice() != null &&
                    sub.getItems().getData().get(0).getPrice().getRecurring() != null) {
                interval = sub.getItems().getData().get(0).getPrice().getRecurring().getInterval(); // "month"
            }
            out.put("interval", interval);
        }
        return ResponseEntity.ok(out);
    }
}
