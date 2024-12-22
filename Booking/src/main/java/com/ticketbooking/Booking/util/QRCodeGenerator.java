package com.ticketbooking.Booking.util;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.ticketbooking.Booking.entity.Booking;

public class QRCodeGenerator {
    private static final Logger logger = LoggerFactory.getLogger(QRCodeGenerator.class);
public static String generateQRCodeBase64(Booking booking, String secretKey) throws Exception {
        String timestamp = Instant.now().toString();
        logger.debug("Timestamp: {}", timestamp);
        logger.debug("Secret Key: {}", secretKey);

        Map<String, Object> eventData = (Map<String, Object>) ((Map<String, Object>) booking.getBookingDetails().get("eventData")).get("event");
        Map<String, Object> venueData = (Map<String, Object>) ((Map<String, Object>) booking.getBookingDetails().get("eventData")).get("venue");
        Map<String, Object> ticketInfo = (Map<String, Object>) booking.getBookingDetails().get("ticketInfo");
        
        // Create data string with full ticketInfo JSON
        String dataToSign = String.format("%d|%d|%s|%s|%s|%s|%s|%s|%s|%d|%d|%s|%s", 
            booking.getTicketId(),
            booking.getUserId(),
            booking.getBookingDate(),
            booking.getBookingTime(),
            booking.getBookingStatus(),
            eventData.get("event_name"),
            eventData.get("event_start_time"),
            eventData.get("event_end_time"),
            venueData.get("venue_name"),
            eventData.get("event_id"),
            venueData.get("venue_id"),
            timestamp,
            new ObjectMapper().writeValueAsString(ticketInfo)  // Full ticketInfo JSON
        );

        logger.debug("Data to Sign: {}", dataToSign);
            
        String signature = QRSecurityUtil.generateHMAC(dataToSign, secretKey);
        logger.debug("Signature: {}", signature);
        
        String secureContent = dataToSign + "|" + signature;
        logger.debug("Secure Content: {}", secureContent);
        
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(secureContent, BarcodeFormat.QR_CODE, 200, 200);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        logger.info("QR Code generated successfully");
        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }
}
