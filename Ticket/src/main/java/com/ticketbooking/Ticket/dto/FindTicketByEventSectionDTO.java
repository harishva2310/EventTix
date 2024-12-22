package com.ticketbooking.Ticket.dto;

import lombok.Data;

@Data
public class FindTicketByEventSectionDTO {
    private Long eventId;
    private Long sectionId;
    
}
