package com.viitorul.donations.api;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.viitorul.donations.config.DonationsProperties;
import com.viitorul.donations.dto.CreateDonationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationsProperties props;

    // minime în „minor units” (2.00 RON = 200, 0.50 EUR = 50)
    private static final Map<String, Long> MIN_MINOR_BY_CURRENCY = Map.of(
            "ron", 200L,
            "eur", 50L,
            "usd", 50L
    );

    public DonationController(DonationsProperties props) {
        this.props = props;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(@Valid @RequestBody CreateDonationRequest req) throws Exception {
        String currency = (req.getCurrency() == null || req.getCurrency().isBlank())
                ? props.getDefaultCurrency()
                : req.getCurrency().toLowerCase();

        long minMinor = MIN_MINOR_BY_CURRENCY.getOrDefault(currency, 50L);
        if (req.getAmount() < minMinor) {
            double minNice = minMinor / 100.0;
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Suma minimă pentru " + currency.toUpperCase() + " este " + minNice
            );
        }

        SessionCreateParams.LineItem.PriceData.ProductData product =
                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName(props.getName())
                        .build();

        SessionCreateParams.LineItem.PriceData priceData =
                SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(currency)
                        .setUnitAmount(req.getAmount())
                        .setProductData(product)
                        .build();

        SessionCreateParams.LineItem item =
                SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(priceData)
                        .build();

        SessionCreateParams.Builder builder =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl(props.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                        .setCancelUrl(props.getCancelUrl())
                        .addLineItem(item)
                        .putMetadata("donor_name", req.getDonorName() == null ? "" : req.getDonorName())
                        .putMetadata("message", req.getMessage() == null ? "" : req.getMessage());

        if (req.getDonorEmail() != null && !req.getDonorEmail().isBlank()) {
            builder.setCustomerEmail(req.getDonorEmail());
        }

        Session session = Session.create(builder.build());
        return ResponseEntity.ok(Map.of("id", session.getId(), "url", session.getUrl()));
    }

    // (opțional, util pentru pagina de „success”)
    @GetMapping("/session/{id}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String id) throws Exception {
        Session s = Session.retrieve(id);
        Map<String, Object> out = new HashMap<>();
        out.put("id", s.getId());
        out.put("amountTotal", s.getAmountTotal());
        out.put("currency", s.getCurrency());
        out.put("paymentStatus", s.getPaymentStatus()); // expected "paid"
        out.put("customerEmail", s.getCustomerEmail());
        return ResponseEntity.ok(out);
    }
}
