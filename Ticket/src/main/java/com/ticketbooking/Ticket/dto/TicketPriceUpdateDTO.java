package com.ticketbooking.Ticket.dto;

import lombok.Data;

@Data
public class TicketPriceUpdateDTO {
    private Long ticketId;
    private Double newPrice;
    private String ticketStatus;
}
