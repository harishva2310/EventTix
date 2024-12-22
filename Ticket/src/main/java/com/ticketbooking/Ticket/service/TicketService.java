package com.ticketbooking.Ticket.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.ticketbooking.Ticket.dao.TicketRepository;
import com.ticketbooking.Ticket.dto.TicketPriceUpdateDTO;
import com.ticketbooking.Ticket.dto.TicketReservationModel;
import com.ticketbooking.Ticket.dto.TicketStatusUpdateDTO;
import com.ticketbooking.Ticket.entity.Ticket;
import com.ticketbooking.Ticket.exception.TicketNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final long RESERVATION_TIMEOUT = 5; // 5 minutes
    private static final Logger logger = LoggerFactory.getLogger(TicketService.class);

    public List<Ticket> getTicketByEventId(Long eventId) {
        List<Ticket> tickets = ticketRepository.findByEventId(eventId);
        logger.info("Fetched tickets for event ID {}: {}", eventId, tickets.size());
        // Enhance tickets with reservation status
        tickets.forEach(ticket -> {
            String reservationKey = "ticket_reservation:" + ticket.getTicketId();
            if (redisTemplate.hasKey(reservationKey)) {
                logger.info("Ticket ID {} is reserved", ticket.getTicketId());
                ticket.setTicketStatus("RESERVED");
            }
        });
        logger.info("Fetched tickets for event ID {}: {}", eventId, tickets.size());
        return tickets;
    }

    public List<Ticket> getTicketByEventIdAndSectionId(Long eventId, Long sectionId) {

        List<Ticket> tickets = ticketRepository.findByEventIdAndSectionId(eventId, sectionId);
        logger.info("Fetched tickets for event ID {} and section ID {}: {}", eventId, sectionId, tickets.size());

        tickets.forEach(ticket -> {
            String reservationKey = "ticket_reservation:" + ticket.getTicketId();
            if (redisTemplate.hasKey(reservationKey)) {
                logger.info("Ticket ID {} is reserved", ticket.getTicketId());
                ticket.setTicketStatus("RESERVED");
            }
        });
        logger.info("Fetched tickets for event ID {} and section ID {}: {}", eventId, sectionId, tickets.size());
        return tickets;
    }

    public List<Ticket> getAvailableTicketsByEvent(Long eventId) {
        logger.info("Fetching available tickets for event ID: {}", eventId);
        return ticketRepository.findByEventIdAndTicketStatus(eventId, "AVAILABLE");
    }

    @Transactional
    public List<Ticket> updateTicketStatuses(List<TicketStatusUpdateDTO> updates) {
        List<Ticket> updatedTickets = new ArrayList<>();

        for (TicketStatusUpdateDTO update : updates) {
            Ticket ticket = ticketRepository.findById(update.getTicketId())
                    .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + update.getTicketId()));
            logger.info("Updating ticket status for ticket ID: {}", update.getTicketId());
            ticket.setTicketStatus(update.getNewStatus());

            updatedTickets.add(ticketRepository.save(ticket));
            logger.info("Updated ticket status for ticket ID: {}", update.getTicketId());
        }

        return updatedTickets;
    }

    @Transactional
    public List<Ticket> updateTicketPrices(List<TicketPriceUpdateDTO> tickets) {
        List<Ticket> updatedTickets = new ArrayList<>();
        for (TicketPriceUpdateDTO update : tickets) {
            Ticket ticket = ticketRepository.findById(update.getTicketId())
                    .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + update.getTicketId()));

            logger.info("Starting update for ticket ID: {}", update.getTicketId());

            if (update.getNewPrice() != null) {
                ticket.setTicketPrice(update.getNewPrice());
                logger.info("Updated price for ticket ID: {}", update.getTicketId());
            }

            if (update.getTicketStatus() != null && !update.getTicketStatus().isEmpty()) {
                ticket.setTicketStatus(update.getTicketStatus());
                logger.info("Updated status for ticket ID: {}", update.getTicketId());
            }

            updatedTickets.add(ticketRepository.save(ticket));
            logger.info("Completed updates for ticket ID: {}", update.getTicketId());
        }

        return updatedTickets;
    }

    @Transactional
    public String deleteByEventId(Long eventId) {
        List<Ticket> tickets = ticketRepository.findByEventId(eventId);
        logger.info("Deleting tickets for event ID: {}", eventId);

        if (tickets.isEmpty()) {
            logger.warn("No tickets found for the given event ID");
            return "No tickets found for the given event ID";
        }

        ticketRepository.deleteAll(tickets);
        logger.info("Deleted tickets for event ID: {}", eventId);

        return "Tickets deleted successfully";
    }

    public boolean reserveTickets(List<Long> ticketIds, String userEmail) {
        logger.info("Reserving tickets for user: {}", userEmail);
        // Check if tickets are available
        for (Long ticketId : ticketIds) {
            String reservationKey = "ticket_reservation:" + ticketId;
            if (redisTemplate.hasKey(reservationKey)) {
                logger.warn("Ticket ID {} is already reserved", ticketId);
                return false;
            }
        }

        // Reserve tickets
        TicketReservationModel reservation = new TicketReservationModel();
        reservation.setTicketIds(ticketIds);
        reservation.setUserEmail(userEmail);
        reservation.setTimestamp(System.currentTimeMillis());
        logger.info("Reserving tickets for user: {}", userEmail);
        logger.debug("Reservation: {}", reservation);
        // Store in Redis with expiration
        for (Long ticketId : ticketIds) {
            String reservationKey = "ticket_reservation:" + ticketId;
            redisTemplate.opsForValue().set(reservationKey, reservation);
            logger.info("Ticket ID {} reserved", ticketId);
            logger.info("Reservation key: {}", reservationKey);

            redisTemplate.expire(reservationKey, RESERVATION_TIMEOUT, TimeUnit.MINUTES);
            logger.info("Reservation key expiration: {}", RESERVATION_TIMEOUT);
        }
        logger.info("Reservation successful for user: {}", userEmail);
        return true;
    }

    public void releaseReservation(List<Long> ticketIds, String userEmail) {
        logger.info("Releasing reservation for user: {}", userEmail);

        for (Long ticketId : ticketIds) {
            String reservationKey = "ticket_reservation:" + ticketId;
            redisTemplate.delete(reservationKey);
            logger.info("Reservation key: {}", reservationKey);
        }
    }

    public List<Ticket> getFirstAvailableTickets(Long eventId, Long sectionId, Integer numberOfTickets) {
        // Get more tickets than needed to account for reservations
        logger.info("Fetching first {} available tickets for event ID {} and section ID {}", numberOfTickets, eventId, sectionId);

        List<Ticket> tickets = ticketRepository.findFirstNAvailableTickets(eventId, sectionId, numberOfTickets * 2);
        logger.info("Found {} tickets", tickets.size());
        // Filter out reserved tickets
        List<Ticket> actuallyAvailableTickets = tickets.stream()
                .filter(ticket -> {
                    String reservationKey = "ticket_reservation:" + ticket.getTicketId();
                    return !redisTemplate.hasKey(reservationKey);
                })
                .limit(numberOfTickets)
                .collect(Collectors.toList());
        logger.info("Found {} available tickets", actuallyAvailableTickets.size());

        return actuallyAvailableTickets;
    }
}
