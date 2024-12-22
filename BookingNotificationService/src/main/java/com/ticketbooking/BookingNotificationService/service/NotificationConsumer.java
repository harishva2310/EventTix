package com.ticketbooking.BookingNotificationService.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ticketbooking.BookingNotificationService.dto.BookingNotificationDTO;
import com.ticketbooking.BookingNotificationService.dto.NotificationMessage;

@Service
public class NotificationConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    private final ObjectMapper objectMapper;

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    public NotificationConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;

        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    }

    @KafkaListener(topics = "booking-notifications", groupId = "notification-group")
    public void consumeBookingNotification(String bookingJson) throws JsonProcessingException {
        // Convert booking to notification message
        logger.debug("Received booking notification: {}", bookingJson);
        logger.info("Received booking notification");

        // First parse to handle Kafka's escaped JSON
        String unescapedJson = objectMapper.readValue(bookingJson, String.class);
        // Then parse to our DTO
        BookingNotificationDTO booking = objectMapper.readValue(unescapedJson, BookingNotificationDTO.class);

        Map<String, Object> eventData = (Map<String, Object>) ((Map<String, Object>) booking.getBookingDetails().get("eventData")).get("event");
        Map<String, Object> venue = (Map<String, Object>) ((Map<String, Object>) booking.getBookingDetails().get("eventData")).get("venue");

        String eventName = (String) eventData.get("event_name");
        String eventStartTime = (String) eventData.get("event_start_time");

        DateTimeFormatter inputFormatter = DateTimeFormatter.ISO_DATE_TIME;
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm");
        String formattedDateTime = LocalDateTime.parse(eventStartTime, inputFormatter).format(outputFormatter);

        String venueName = (String) venue.get("venue_name");
        String venueAddress = String.format("%s, %s, %s",
                venue.get("venue_address"),
                venue.get("venue_city"),
                venue.get("venue_state"));

        NotificationMessage notification = new NotificationMessage(
                "Booking Confirmed",
                String.format("Your booking for %s at %s (%s) is confirmed. Event starts at %s. Booking ID: %d",
                        eventName,
                        venueName,
                        venueAddress,
                        formattedDateTime,
                        booking.getBookingId()),
                booking.getUserId()
        );

        sendBookingConfirmationEmail(booking, eventName, venueName, venueAddress, formattedDateTime);

        String destination = "/topic/notifications/" + booking.getUserId();
        logger.debug("Sending to destination: {}", destination);
        logger.info("Sending notification to destination: {}", destination);

        messagingTemplate.convertAndSend(destination, notification);
    }

    private void sendBookingConfirmationEmail(BookingNotificationDTO booking, String eventName,
            String venueName, String venueAddress, String formattedDateTime) {
        logger.info("Sending booking confirmation email to user: {}", booking.getUserId());

        Map<String, Object> userDetails = (Map<String, Object>) booking.getBookingDetails().get("userDetails");
        Map<String, Object> ticketInfo = (Map<String, Object>) booking.getBookingDetails().get("ticketInfo");
        String userEmail = (String) userDetails.get("email");

        String jsonPayload = String.format("""
                {
                    "Messages":[{
                        "From": {
                            "Email": "harish.va1910@gmail.com",
                            "Name": "EventTix"
                        },
                        "To": [{
                            "Email": "%s",
                            "Name": "%s"
                        }],
                        "TemplateID": 6494117,
                        "TemplateLanguage": true,
                        "Subject": "EventTix ticket booking",
                        "Variables": {
                            "ticket_price": "%s",
                            "booking_id": "%d",
                            "booking_date": "%s",
                            "total_price": "%s",
                            "venue_address": "%s",
                            "venue_name": "%s",
                            "event_name": "%s",
                            "ticket_id": "%s",
                            "first_name": "%s"
                        }
                    }]
                }""",
                userEmail,
                userDetails.get("firstName"),
                ticketInfo.get("price"),
                booking.getBookingId(),
                formattedDateTime,
                booking.getBookingDetails().get("totalPrice"),
                venueAddress,
                venueName,
                eventName,
                ticketInfo.get("ticketId"),
                userDetails.get("firstName")
        );

        // Rest of the email sending code remains the same
        HttpClient client = HttpClient.newHttpClient();
        String auth = Base64.getEncoder().encodeToString(
                (System.getenv("MJ_APIKEY_PUBLIC") + ":" + System.getenv("MJ_APIKEY_PRIVATE")).getBytes()
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.mailjet.com/v3.1/send"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + auth)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            logger.debug(response.body());
            logger.info("Email sent successfully");
        } catch (Exception e) {
            logger.error("Error sending email", e);
        }
    }
}
