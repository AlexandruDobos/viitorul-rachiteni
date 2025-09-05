package com.viitorul.donations.api;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.viitorul.donations.config.DonationsProperties;
import com.viitorul.donations.dto.CreateDonationRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationsProperties props;

    public DonationController(DonationsProperties props) {
        this.props = props;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(@Valid @RequestBody CreateDonationRequest req) throws Exception {
        String currency = (req.getCurrency() == null || req.getCurrency().isBlank())
                ? props.getDefaultCurrency()
                : req.getCurrency().toLowerCase();

        SessionCreateParams.LineItem.PriceData.ProductData product =
                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName(props.getName())
                        .build();

        SessionCreateParams.LineItem.PriceData priceData =
                SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(currency)
                        .setUnitAmount(req.getAmount()) // minor units
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
}
