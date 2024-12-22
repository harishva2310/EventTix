package com.ticketbooking.BookingNotificationService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NotificationMessage {
    private String title;
    private String message;
    private Long userId;
    
}
