package com.ticketbooking.Ticket.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ticketbooking.Ticket.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByEventId(Long eventId);
    List<Ticket> findByEventIdAndSectionId(Long eventId, Long sectionId);
    List<Ticket> findByEventIdAndSectionIdAndTicketStatus(Long eventId, Long sectionId, String ticketStatus);
    List<Ticket> findByEventIdAndTicketStatus(Long eventId, String ticketStatus);
    @Query(value = "SELECT t FROM Ticket t WHERE t.eventId = :eventId AND t.sectionId = :sectionId AND t.ticketStatus = 'AVAILABLE' ORDER BY t.ticketId LIMIT :numberOfTickets")
    List<Ticket> findFirstNAvailableTickets(Long eventId, Long sectionId, Integer numberOfTickets);
}
