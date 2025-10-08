package com.viitorul.common.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Eveniment simplu trimis după orice plată reușită (invoice.paid) a unui abonament. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPaymentCompletedEvent {
    private String stripeSubscriptionId;
    private String stripeInvoiceId;
    private Long amount;         // minor units
    private String currency;     // ron/eur
    private String supporterEmail;
    private String supporterName;
    private String message;      // din metadata checkout (dacă a fost setat)
}
