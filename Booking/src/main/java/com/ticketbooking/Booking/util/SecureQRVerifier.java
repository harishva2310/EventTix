package com.ticketbooking.Booking.util;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
@Component
public class SecureQRVerifier {

    private static final Logger logger = LoggerFactory.getLogger(SecureQRVerifier.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    //private static final RestTemplate restTemplate = new RestTemplate();
    private static final String TICKET_VERIFY_URL = "http://ticket-service/api/tickets/verify-tickets";

    private final RestTemplate restTemplate;

    @Autowired
    public SecureQRVerifier(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public VerificationResult verifyQRCodeText(String decodedContent, String secretKey, String eventSecretKey) throws Exception {
        String[] parts = decodedContent.split("\\|");
    
        if (parts.length != 14) {
            logger.error("Invalid QR code content.");
            return new VerificationResult(false, null, "Invalid QR code format");
        }
    
        String data = String.join("|", Arrays.copyOfRange(parts, 0, 13));
        String signature = parts[13];
    
        if (!QRSecurityUtil.verifyHMAC(data, signature, secretKey)) {
            logger.error("Signature verification failed.");
            return new VerificationResult(false, null, "Invalid signature");
        }
    
        LocalDateTime bookingDateTime = LocalDateTime.parse(parts[2] + "T" + parts[3], DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        LocalDateTime eventEndDate = LocalDateTime.parse(parts[7], DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    
        Map<String, Object> ticketInfo = objectMapper.readValue(parts[12], Map.class);
        List<Map<String, Object>> ticketsToVerify = Arrays.asList(ticketInfo);
    
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<Map<String, Object>>> requestEntity = new HttpEntity<>(ticketsToVerify, headers);
    
        try {
            Map<String, List<Map<String, Object>>> response = restTemplate.postForObject(
                    TICKET_VERIFY_URL + "?secretKey=" + eventSecretKey,
                    requestEntity,
                    Map.class
            );
    
            List<Map<String, Object>> results = response.get("results");
            Map<String, Object> ticketResult = results.stream()
                    .filter(result -> result.get("ticketId").equals(ticketInfo.get("ticketId")))
                    .findFirst()
                    .orElse(null);
    
            if (ticketResult == null) {
                return new VerificationResult(false, ticketInfo, "Ticket verification failed");
            }
    
            boolean isTimeValid = bookingDateTime.isBefore(eventEndDate) && LocalDateTime.now().isBefore(eventEndDate);
            boolean isTicketValid = (Boolean) ticketResult.get("valid");
            String message = (String) ticketResult.get("message");
    
            return new VerificationResult(isTicketValid && isTimeValid, ticketInfo, message);
    
        } catch (Exception e) {
            logger.error("Ticket verification service error: ", e);
            return new VerificationResult(false, null, "Verification service error");
        }
    }

    

    public  VerificationResult verifyQRCode(String base64Image, String secretKey, String eventSecretKey) throws Exception {
        String decodedContent = decodeQRCode(base64Image);
        String[] parts = decodedContent.split("\\|");
        
        if (parts.length != 14) {
            logger.error("Invalid QR code content.");
            return new VerificationResult(false, null, "Invalid QR code format");
        }

        String data = String.join("|", Arrays.copyOfRange(parts, 0, 13));
        String signature = parts[13];

        if (!QRSecurityUtil.verifyHMAC(data, signature, secretKey)) {
            logger.error("Signature verification failed.");
            return new VerificationResult(false, null, "Invalid signature");
        }

        LocalDateTime bookingDateTime = LocalDateTime.parse(parts[2] + "T" + parts[3], DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        LocalDateTime eventEndDate = LocalDateTime.parse(parts[7], DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        
        Map<String, Object> ticketInfo = objectMapper.readValue(parts[12], Map.class);
        List<Map<String, Object>> ticketsToVerify = Arrays.asList(ticketInfo);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<Map<String, Object>>> requestEntity = new HttpEntity<>(ticketsToVerify, headers);
        
        try {
            Map<String, List<Map<String, Object>>> response = restTemplate.postForObject(
                TICKET_VERIFY_URL + "?secretKey=" + eventSecretKey,
                requestEntity,
                Map.class
            );

            List<Map<String, Object>> results = response.get("results");
            Map<String, Object> ticketResult = results.stream()
                .filter(result -> result.get("ticketId").equals(ticketInfo.get("ticketId")))
                .findFirst()
                .orElse(null);

            if (ticketResult == null) {
                return new VerificationResult(false, ticketInfo, "Ticket verification failed");
            }

            boolean isTimeValid = bookingDateTime.isBefore(eventEndDate) && LocalDateTime.now().isBefore(eventEndDate);
            boolean isTicketValid = (Boolean) ticketResult.get("valid");
            String message = (String) ticketResult.get("message");

            return new VerificationResult(isTicketValid && isTimeValid, ticketInfo, message);
            
        } catch (Exception e) {
            logger.error("Ticket verification service error: ", e);
            return new VerificationResult(false, null, "Verification service error");
        }
    }

    public static class VerificationResult {
        private final boolean valid;
        private final Map<String, Object> ticketInfo;
        private final String message;

        public VerificationResult(boolean valid, Map<String, Object> ticketInfo, String message) {
            this.valid = valid;
            this.ticketInfo = ticketInfo;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public Map<String, Object> getTicketInfo() {
            return ticketInfo;
        }

        public String getMessage() {
            return message;
        }
    }


    private static String decodeQRCode(String base64Image) throws Exception {
        String cleanBase64 = base64Image.replaceAll("^data:image/\\w+;base64,", "");
        byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);
        BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

        LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result result = new MultiFormatReader().decode(bitmap);
        return result.getText();
    }
}
