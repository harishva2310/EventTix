package com.ticketbooking.Ticket.entity;

import java.time.LocalDateTime;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "ticket")
@Data
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long ticketId;
    
    @Column(name="event_id")
    private Long eventId;

    @Column(name="venue_id")
    private Long venueId;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "seat_number")
    private String seatNumber;

    @Column(name = "ticket_details", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> ticketDetails;

    @Column(name = "ticket_status")
    private String ticketStatus;

    @Column(name = "ticket_section_seating")
    private String ticketSectionSeating;

    @Column(name="ticket_price")
    private Double ticketPrice;

    @Column(name="ticket_code")
    private String ticketCode;

    @Column(name="ticket_date_created")
    private LocalDateTime ticketDateTime;

}
