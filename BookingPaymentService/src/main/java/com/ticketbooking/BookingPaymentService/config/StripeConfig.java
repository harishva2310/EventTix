package com.ticketbooking.BookingPaymentService.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.stripe.Stripe;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "stripe")
@Getter
@Setter
public class StripeConfig {
    private Api api = new Api();

    @PostConstruct
    public void init() {
        Stripe.apiKey = api.getKey();
    }

    @Getter
    @Setter
    public static class Api {
        private String key;
        private String publicKey;
        
    }
}
