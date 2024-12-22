package com.ticketbooking.Booking.util;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class QRSecurityUtil {

    private static final Logger logger = LoggerFactory.getLogger(QRSecurityUtil.class);

    public static String generateHMAC(String data, String key) throws Exception {
        logger.debug("Generating HMAC for data: {}", data);
        logger.debug("Using key: {}", key);
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");

        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        return Base64.getEncoder().encodeToString(sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }

    public static boolean verifyHMAC(String data, String signature, String key) throws Exception {
        String calculatedSignature = generateHMAC(data, key);
        logger.debug("Calculated Signature: {}", calculatedSignature);
        logger.debug("Received Signature: {}", signature);
        logger.debug("Original data: {}", data);
        return calculatedSignature.equals(signature);
    }
}
