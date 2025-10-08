package com.viitorul.donations.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CreateSubscriptionRequest {
    @NotBlank
    private String planCode;     // ex: ron_50, eur_250 (mapat la priceId)
    @Email
    private String supporterEmail; // optional dar util pentru customer
    private String supporterName;  // optional
    private String message;        // optional

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public String getSupporterEmail() { return supporterEmail; }
    public void setSupporterEmail(String supporterEmail) { this.supporterEmail = supporterEmail; }

    public String getSupporterName() { return supporterName; }
    public void setSupporterName(String supporterName) { this.supporterName = supporterName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
