// com/viitorul/donations/service/SubscriptionService.java
package com.viitorul.donations.service;

import com.stripe.model.Invoice;
import com.stripe.model.SubscriptionCollection;
import com.stripe.model.checkout.Session;
import com.viitorul.donations.domain.Subscription;
import com.viitorul.donations.domain.SubscriptionPayment;
import com.viitorul.donations.domain.SubscriptionStatus;
import com.viitorul.donations.repository.SubscriptionPaymentRepository;
import com.viitorul.donations.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subRepo;
    private final SubscriptionPaymentRepository payRepo;

    public SubscriptionService(SubscriptionRepository subRepo,
                               SubscriptionPaymentRepository payRepo) {
        this.subRepo = subRepo;
        this.payRepo = payRepo;
    }

    /** La checkout.session.completed (mode=subscription) persistăm/actualizăm abonamentul. */
    @Transactional
    public Subscription upsertFromCheckoutSession(Session session) {
        // subscription id există doar pe sesiuni subscription
        String stripeSubId = session.getSubscription();
        if (stripeSubId == null || stripeSubId.isBlank()) {
            // Nimic de salvat încă
            return null;
        }

        Subscription sub = subRepo.findByStripeSubscriptionId(stripeSubId).orElseGet(() -> {
            Subscription ns = new Subscription();
            ns.setStripeSubscriptionId(stripeSubId);
            ns.setStatus(SubscriptionStatus.CREATED);
            return ns;
        });

        sub.setStripeCustomerId(session.getCustomer());
        sub.setSupporterEmail(session.getCustomerEmail());
        if (session.getMetadata() != null) {
            sub.setSupporterName(session.getMetadata().get("donor_name")); // re-folosim cheile
        }
        // price id – Stripe nu o pune direct în session; dar putem citi din subscription (în webhook o cerem expand) sau din line items
        // Totuși, dacă nu o știm aici, o completăm mai târziu din webhook-ul invoice.paid (invoice.getLines().getData().get(0).getPrice().getId()).
        return subRepo.save(sub);
    }

    /** Idempotent: salvează tranzacția de pe invoice.paid + setează status abonament. */
    @Transactional
    public void recordInvoicePaid(Invoice invoice) {
        String invoiceId = invoice.getId();
        if (invoiceId == null) return;

        // dacă deja am salvat acest invoice, ieșim
        if (payRepo.findByStripeInvoiceId(invoiceId).isPresent()) return;

        String subId = invoice.getSubscription();
        Subscription sub = subRepo.findByStripeSubscriptionId(subId).orElseGet(() -> {
            Subscription ns = new Subscription();
            ns.setStripeSubscriptionId(subId);
            ns.setStatus(SubscriptionStatus.CREATED);
            ns.setStripeCustomerId(invoice.getCustomer());
            return subRepo.save(ns);
        });

        // setăm priceId/planCode dacă le știm din invoice
        if (invoice.getLines() != null && !invoice.getLines().getData().isEmpty()
                && invoice.getLines().getData().get(0).getPrice() != null) {
            var price = invoice.getLines().getData().get(0).getPrice();
            if (price != null && price.getId() != null) {
                sub.setStripePriceId(price.getId());
            }
        }

        // Actualizăm status abonament la ACTIVE (dacă e plătit)
        if (Boolean.TRUE.equals(invoice.getPaid())) {
            sub.setStatus(SubscriptionStatus.ACTIVE);
        }

        subRepo.save(sub);

        SubscriptionPayment sp = new SubscriptionPayment();
        sp.setSubscription(sub);
        sp.setStripeInvoiceId(invoiceId);
        sp.setPaymentIntentId(invoice.getPaymentIntent());
        sp.setAmountPaid(invoice.getAmountPaid());      // long minor units
        sp.setCurrency(invoice.getCurrency());          // ex: "ron"
        sp.setPaidAt(OffsetDateTime.now());             // sau invoice.getStatusTransitions().getPaidAt() dacă vrei exact
        payRepo.save(sp);
    }

    /** Optional: marcare anulare. */
    @Transactional
    public void markCanceled(String stripeSubscriptionId) {
        subRepo.findByStripeSubscriptionId(stripeSubscriptionId).ifPresent(s -> {
            s.setStatus(SubscriptionStatus.CANCELED);
            s.setCanceledAt(OffsetDateTime.now());
            subRepo.save(s);
        });
    }
}
