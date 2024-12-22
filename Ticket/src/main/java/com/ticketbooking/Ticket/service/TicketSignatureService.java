package com.ticketbooking.Ticket.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ticketbooking.Ticket.entity.Ticket;

@Service
public class TicketSignatureService {

    private static final Logger logger = LoggerFactory.getLogger(TicketSignatureService.class);

    private static final DateTimeFormatter TIMESTAMP_FORMATTER
            = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSS");

    public String generateTicketCode(Ticket ticket, String secretKey) throws Exception {
        try {
            String formattedTimestamp = ticket.getTicketDateTime().format(TIMESTAMP_FORMATTER);

            String seatNumberFinal = ticket.getSeatNumber() != null ? ticket.getSeatNumber() : "NA";

            logger.debug("Formatted timestamp: {}", formattedTimestamp);
            logger.debug("Seat number: {}", seatNumberFinal);
            logger.debug("Ticket ID: {}", ticket.getTicketId());
            logger.debug("Event ID: {}", ticket.getEventId());
            logger.debug("Venue ID: {}", ticket.getVenueId());
            logger.debug("Section ID: {}", ticket.getSectionId());

            String payload = String.format("%d|%d|%d|%d|%s|%s",
                    ticket.getTicketId(), // Added ticketId
                    ticket.getEventId(),
                    ticket.getVenueId(),
                    ticket.getSectionId(),
                    seatNumberFinal,
                    formattedTimestamp);
            logger.debug("Generated payload: {}", payload);

            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            sha256Hmac.init(secretKeySpec);
            logger.debug("Secret key: {}", secretKey);

            byte[] hmacBytes = sha256Hmac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8)
            );
            logger.debug("Generated Ticket Code: {}", Base64.getEncoder().encodeToString(hmacBytes));
            return Base64.getEncoder().encodeToString(hmacBytes);

        } catch (Exception e) {
            logger.error("Error generating ticket signature", e);
            throw new RuntimeException("Error generating ticket signature", e);
        }
    }

    public boolean validateTicketCode(Ticket ticket, String secretKey) {
        try {
            String expectedCode = generateTicketCode(ticket, secretKey);
            logger.debug("Expected Ticket Code: {}", expectedCode);
            logger.debug("Actual Ticket Code: {}", ticket.getTicketCode());

            if (ticket.getTicketCode() == null) {
                return false;
            }

            boolean isValid = MessageDigest.isEqual(
                    expectedCode.getBytes(StandardCharsets.UTF_8),
                    ticket.getTicketCode().getBytes(StandardCharsets.UTF_8)
            );

            if (!isValid) {
                String formattedTimestamp = ticket.getTicketDateTime().format(TIMESTAMP_FORMATTER);
                String payload = String.format("%d|%d|%d|%d|%s|%s",
                        ticket.getTicketId(), // Added ticketId
                        ticket.getEventId(),
                        ticket.getVenueId(),
                        ticket.getSectionId(),
                        ticket.getSeatNumber(),
                        formattedTimestamp);
                logger.debug("Validation failed. Payload used: {}", payload);
            }

            return isValid;
        } catch (Exception e) {
            logger.error("Error validating ticket signature", e);
            return false;
        }
    }

}
