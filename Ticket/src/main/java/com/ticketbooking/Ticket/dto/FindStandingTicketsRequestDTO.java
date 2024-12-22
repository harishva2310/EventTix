package com.ticketbooking.Ticket.dto;

import lombok.Data;

@Data
public class FindStandingTicketsRequestDTO {
    private Long eventId;
    private Long sectionId;
    private Integer numberOfTickets;
}
