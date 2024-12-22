package com.ticketbooking.Booking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketbooking.Booking.entity.Booking;

@Service
public class BookingNotificationService {
    @Autowired
    private final KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Logger logger = LoggerFactory.getLogger(BookingNotificationService.class);
    
    public BookingNotificationService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    
    public void sendBookingNotification(Booking booking) throws JsonProcessingException {
        try {
            String bookingJson = objectMapper.writeValueAsString(booking);
            logger.debug("Sending booking notification: {}", bookingJson);
            kafkaTemplate.send("booking-notifications", booking.getBookingId().toString(), bookingJson);
            logger.info("Booking notification sent successfully");
        } catch (JsonProcessingException e) {
            logger.error("Error sending booking notification: {}", e.getMessage());
            throw e;
        }
        catch (Exception e) {
            logger.error("Error sending booking notification: {}", e.getMessage());
            throw e;
        }
        
    }
}
