package com.viitorul.donations.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateDonationRequest {
    @NotNull @Min(100)
    private Long amount;          // în "minor units"
    private String currency;      // optional: ron/eur...
    private String donorEmail;    // optional
    private String donorName;     // optional
    private String message;       // optional

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDonorEmail() { return donorEmail; }
    public void setDonorEmail(String donorEmail) { this.donorEmail = donorEmail; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
