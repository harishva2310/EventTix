package com.ticketbooking.BookingPaymentService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private Long amount;
    private String currency;
    private String paymentMethodId;
    private String description;
    private String customerEmail;
}
