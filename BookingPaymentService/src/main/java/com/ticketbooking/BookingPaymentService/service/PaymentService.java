package com.ticketbooking.BookingPaymentService.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.ticketbooking.BookingPaymentService.config.StripeConfig;
import com.ticketbooking.BookingPaymentService.exception.PaymentProcessingException;
import com.ticketbooking.BookingPaymentService.model.PaymentRequest;
import com.ticketbooking.BookingPaymentService.model.PaymentStatus;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentService {

    @Autowired
    private StripeConfig stripeConfig;

    public PaymentIntent createPaymentIntent(PaymentRequest paymentRequest) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(paymentRequest.getAmount())
                    .setCurrency(paymentRequest.getCurrency().toLowerCase())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();
            System.out.println("Amount: " + paymentRequest.getAmount());
            return PaymentIntent.create(params);
        } catch (StripeException e) {
            log.error("Error creating payment intent", e);
            throw new PaymentProcessingException("Error processing payment", e);
        }
    }

    public PaymentStatus checkPaymentStatus(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return new PaymentStatus(
                    paymentIntent.getId(),
                    paymentIntent.getStatus(),
                    paymentIntent.getAmount(),
                    paymentIntent.getCurrency()
            );
        } catch (StripeException e) {
            log.error("Error checking payment status", e);
            throw new PaymentProcessingException("Error checking payment status", e);
        }
    }

    public PaymentIntent confirmPayment(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder().build();
            return paymentIntent.confirm(params);
        } catch (StripeException e) {
            log.error("Error confirming payment", e);
            throw new PaymentProcessingException("Error confirming payment", e);
        }
    }

    public PaymentIntent cancelPayment(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return paymentIntent.cancel();
        } catch (StripeException e) {
            log.error("Error canceling payment", e);
            throw new PaymentProcessingException("Error canceling payment", e);
        }
    }

    public PaymentIntent getPaymentDetails(String paymentIntentId) {
        try {
            return PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            log.error("Error retrieving payment details", e);
            throw new PaymentProcessingException("Error retrieving payment details", e);
        }
    }

    public PaymentIntent refundPayment(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            Map<String, Object> params = new HashMap<>();
            params.put("payment_intent", paymentIntentId);

            Refund.create(params);
            return PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            throw new RuntimeException("Error processing refund: " + e.getMessage());
        }
    }
}
