package com.ticketbooking.Ticket.dto;

import lombok.Data;

@Data
public class TicketStatusUpdateDTO {
    private Long ticketId;
    private String newStatus;
    
}
