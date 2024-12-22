package com.ticketbooking.BookingPaymentService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String status;
    
}
