package com.ticketbooking.BookingPaymentService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentStatus {
    private String paymentIntentId;
    private String status;
    private Long amount;
    private String currency;
}
