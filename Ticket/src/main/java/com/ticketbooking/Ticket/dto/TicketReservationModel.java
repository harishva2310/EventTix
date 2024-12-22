package com.ticketbooking.Ticket.dto;

import java.io.Serializable;
import java.util.List;

import lombok.Data;

@Data
public class TicketReservationModel implements Serializable {
    
    private List<Long> ticketIds;
    private long timestamp;
    private String userEmail;
}
