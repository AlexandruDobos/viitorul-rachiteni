package com.viitorul.donations.domain;

public enum SubscriptionStatus {
    CREATED,     // creat prin checkout, încă neconfirmat
    ACTIVE,      // activ (după checkout.session.completed + invoice.paid)
    INCOMPLETE,  // stripe status „incomplete”/nu s-a plătit prima factură
    PAST_DUE,    // datorie
    CANCELED,    // anulat
    UNPAID       // neplătit
}