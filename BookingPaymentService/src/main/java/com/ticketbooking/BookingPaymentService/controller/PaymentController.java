package com.ticketbooking.BookingPaymentService.controller;

import java.security.interfaces.RSAPublicKey;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.stripe.model.PaymentIntent;
import com.ticketbooking.BookingPaymentService.config.StripeConfig;
import com.ticketbooking.BookingPaymentService.model.PaymentRequest;
import com.ticketbooking.BookingPaymentService.service.PaymentService;



@RestController
@RequestMapping("/api/payments")

public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private StripeConfig stripeConfig;

    @Value("${auth0.domainUrl}")
    private String domainUrl;

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody PaymentRequest paymentRequest,
                                                                @RequestHeader("Authorization") String token ){
        try {
            logger.info("Received payment request: {}", paymentRequest);
            logger.info("Currency: {}", paymentRequest.getCurrency());
            logger.info("Amount: {}", paymentRequest.getAmount());

            verifyToken(token);

            PaymentIntent paymentIntent = paymentService.createPaymentIntent(paymentRequest);
            logger.info("Payment intent created: {}", paymentIntent);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            logger.debug("Response: {}", response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {

            logger.error("Error creating payment intent: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error creating payment intent"));
        }
    }

    @PostMapping("/confirm/{paymentIntentId}")
    public ResponseEntity<PaymentIntent> confirmPayment(@PathVariable String paymentIntentId,
                                                @RequestHeader("Authorization") String token) {

        try {
            logger.info("Received payment intent ID: {}", paymentIntentId);
            logger.info("Attempting to confirm payment...");

            verifyToken(token);

            PaymentIntent paymentIntent = paymentService.confirmPayment(paymentIntentId);
            logger.info("Payment confirmed successfully");

            return ResponseEntity.ok(paymentIntent);
        } catch (Exception e) {

            logger.error("Error confirming payment: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/cancel/{paymentIntentId}")
    public ResponseEntity<PaymentIntent> cancelPayment(@PathVariable String paymentIntentId,
                                                @RequestHeader("Authorization") String token) {
        try {
            logger.info("Received payment intent ID: {}", paymentIntentId);
            logger.info("Attempting to cancel payment...");

            verifyToken(token);

            PaymentIntent paymentIntent = paymentService.cancelPayment(paymentIntentId);
            logger.info("Payment canceled successfully");

            return ResponseEntity.ok(paymentIntent);
        } catch (Exception e) {
            logger.error("Error canceling payment: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/payment-intent/{paymentIntentId}")
    public ResponseEntity<Map<String, String>> getPaymentIntent(@PathVariable String paymentIntentId,
                                                                @RequestHeader("Authorization") String token ) {
        try {
            logger.info("Received payment intent ID: {}", paymentIntentId);
            logger.info("Attempting to get payment intent...");

            verifyToken(token);

            PaymentIntent paymentIntent = paymentService.getPaymentDetails(paymentIntentId);
            logger.info("Payment intent retrieved successfully");
            logger.debug(paymentIntentId, paymentIntent);

            Map<String, String> response = new HashMap<>();
            response.put("status", paymentIntent.getStatus());
            logger.info("Payment intent retrieved successfully");
            logger.debug("Response: {}", response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting payment intent: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error getting payment intent"));
        }
    }

    @PostMapping("/refund/{paymentIntentId}")
    public ResponseEntity<Map<String, String>> refundPayment(@PathVariable String paymentIntentId,
                                                    @RequestHeader("Authorization") String token) {
        try {
            logger.info("Received payment intent ID: {}", paymentIntentId);
            logger.info("Attempting to refund payment...");

            verifyToken(token);

            PaymentIntent refundedPayment = paymentService.refundPayment(paymentIntentId);
            logger.info("Payment refunded successfully");
            logger.debug("Refunded payment: {}", refundedPayment);

            Map<String, String> response = new HashMap<>();
            response.put("status", refundedPayment.getStatus());
            response.put("refundStatus", "succeeded");
            response.put("refundedAmount", String.valueOf(refundedPayment.getAmount()));

            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error refunding payment: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error refunding payment"));
        }
    }

    private DecodedJWT verifyToken(String token) throws Exception {
        JwkProvider provider = new UrlJwkProvider(domainUrl);
        DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));
        Jwk jwk = provider.get(jwt.getKeyId());

        logger.info("JWT Key ID: {}", jwt.getKeyId());

        Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
        logger.info("JWT Issuer: {}", jwt.getIssuer());
        return JWT.require(algorithm)
                .withIssuer(jwt.getIssuer())
                .build()
                .verify(token.replace("Bearer ", ""));
    }

}
