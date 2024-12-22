package com.ticketbooking.Ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TicketVerificationResult {
    private Long ticketId;
    private boolean valid;
    private String message;
}
