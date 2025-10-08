package com.viitorul.donations.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConfigurationProperties(prefix = "subscriptions")
public class SubscriptionsProperties {
    private String successUrl;
    private String cancelUrl;
    private String name;
    private Map<String, String> prices; // planCode -> priceId

    public String getSuccessUrl() { return successUrl; }
    public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }

    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Map<String, String> getPrices() { return prices; }
    public void setPrices(Map<String, String> prices) { this.prices = prices; }
}
