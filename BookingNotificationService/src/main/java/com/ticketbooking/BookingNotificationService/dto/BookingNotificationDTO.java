package com.ticketbooking.BookingNotificationService.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class BookingNotificationDTO {
    
    private Long bookingId;

    
    private Long userId;

    
    private Long ticketId;

    
    private String bookingDate;

    
    private String bookingTime;

    
    private String bookingStatus;

    @JsonProperty("bookingDetails")
    private Map<String, Object> bookingDetails;
}
