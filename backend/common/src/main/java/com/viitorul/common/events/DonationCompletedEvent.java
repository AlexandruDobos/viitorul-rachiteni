package com.viitorul.common.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationCompletedEvent implements Serializable {
    private String sessionId;
    private Long amount;       // minor units (ex: 200 = 2.00)
    private String currency;   // ex: "ron"
    private String donorEmail; // emailul capturat la checkout
    private String donorName;  // metadata: donor_name (dacă există)
    private String message;    // metadata: message (dacă există)
}
