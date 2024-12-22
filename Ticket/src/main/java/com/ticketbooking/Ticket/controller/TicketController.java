package com.ticketbooking.Ticket.controller;

import java.security.interfaces.RSAPublicKey;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.ticketbooking.Ticket.dao.TicketRepository;
import com.ticketbooking.Ticket.dto.FindStandingTicketsRequestDTO;
import com.ticketbooking.Ticket.dto.FindTicketByEventSectionDTO;
import com.ticketbooking.Ticket.dto.TicketPriceUpdateDTO;
import com.ticketbooking.Ticket.dto.TicketStatusUpdateDTO;
import com.ticketbooking.Ticket.dto.TicketVerificationResult;
import com.ticketbooking.Ticket.entity.Ticket;
import com.ticketbooking.Ticket.service.TicketService;
import com.ticketbooking.Ticket.service.TicketSignatureService;

import io.lettuce.core.RedisConnectionException;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private TicketSignatureService ticketSignatureService;

    @Value("${auth0.domainUrl}")
    private String domainUrl;

    private static final Logger logger = LoggerFactory.getLogger(TicketController.class);

    @GetMapping("/id/{ticketId}")
    public ResponseEntity<Ticket> getTicket(@RequestParam Long ticketId) {
        logger.info("Received request to get ticket with ID: {}", ticketId);
        Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket != null) {
            logger.debug("Found ticket: {}", ticket);
            return ResponseEntity.ok(ticket);
        } else {
            logger.warn("Ticket not found with ID: {}", ticketId);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/findByEvent")
    public ResponseEntity<List<Ticket>> getTicketsByEventId(@RequestParam("eventId") Long eventId) {
        try {
            logger.info("Received request to get tickets for event ID: {}", eventId);
            List<Ticket> tickets = ticketService.getTicketByEventId(eventId);
            if (!tickets.isEmpty()) {
                logger.debug("Found tickets: {}", tickets);
            } else {
                logger.warn("No tickets found for event ID: {}", eventId);
            }
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            logger.error("Error while fetching tickets for event ID: {}", eventId, e);
            return ResponseEntity.notFound().build();
        }

    }

    @PostMapping("/findByEventSection")
    public ResponseEntity<List<Ticket>> getTicketsByEventIdAndSectionId(@RequestBody FindTicketByEventSectionDTO request,
            @RequestHeader("Authorization") String token
    ) {
        try {
            verifyToken(token);
            logger.info("Received request to get tickets for event ID: {} and section ID: {}", request.getEventId(), request.getSectionId());
            List<Ticket> tickets = ticketService.getTicketByEventIdAndSectionId(request.getEventId(), request.getSectionId());
            if (!tickets.isEmpty()) {
                logger.debug("Found {} tickets", tickets.size());
            } else {
                logger.warn("No tickets found for event ID: {} and section ID: {}", request.getEventId(), request.getSectionId());
            }
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            logger.error("Error occurred while processing the request", e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/findFirstAvailable")
    public ResponseEntity<?> getFirstAvailableTickets(@RequestBody FindStandingTicketsRequestDTO request,
            @RequestHeader("Authorization") String token
    ) {
        try {
            verifyToken(token);
            List<Ticket> tickets = ticketService.getFirstAvailableTickets(
                    request.getEventId(),
                    request.getSectionId(),
                    //Math.min(request.getNumberOfTickets(), 8), Limit to 8 tickets
                    request.getNumberOfTickets()
            );
            logger.info("Found {} tickets", tickets.size());
            

            if (tickets.size() < request.getNumberOfTickets()) {
                logger.warn("Not enough tickets available");
                return ResponseEntity.badRequest().body("Requested amount of Tickets not available");
            }

            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            logger.error("Error while fetching tickets", e);
            return ResponseEntity.badRequest().body("Invalid Request");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        try {
            Ticket createdTicket = ticketRepository.save(ticket);
            logger.info("Created ticket: {}", createdTicket);
            return ResponseEntity.ok(createdTicket);
        } catch (Exception e) {
            logger.error("Error occurred while creating ticket", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/create-bulk")
    public ResponseEntity<List<Ticket>> createTickets(@RequestBody List<Ticket> tickets) {
        try {
            List<Ticket> createdTickets = ticketRepository.saveAll(tickets);
            logger.info("Created tickets: {}", createdTickets.size());
            return ResponseEntity.ok(createdTickets);
        } catch (Exception e) {
            logger.error("Error occurred while creating tickets", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/v2/create-bulk")
    public ResponseEntity<String> createCrytpoSignedTickets(@RequestBody List<Ticket> tickets, @RequestParam("secretKey") String secretKey) throws Exception {
        try {
            
            int batchSize = 1000;
            List<Ticket> allCreatedTickets = new ArrayList<>();

            for (int i = 0; i < tickets.size(); i += batchSize) {
                List<Ticket> batch = tickets.subList(i, Math.min(i + batchSize, tickets.size()));
                logger.info("Creating batch of {} tickets", batch.size());
                logger.debug("Batch: {}", batch);

                // First save the tickets to generate IDs
                List<Ticket> savedBatch = ticketRepository.saveAll(batch);

                // Then generate ticket codes with the generated IDs
                savedBatch.forEach(ticket -> {
                    LocalDateTime timestamp = LocalDateTime.now(); // Capture single timestamp
                    ticket.setTicketDateTime(timestamp);
                    try {
                        ticket.setTicketCode(ticketSignatureService.generateTicketCode(ticket, secretKey));
                    } catch (Exception e) {
                        logger.error("Error occurred while generating ticket code", e);
                        e.printStackTrace();
                    }
                });

                // Save again with the generated ticket codes
                allCreatedTickets.addAll(ticketRepository.saveAll(savedBatch));
            }

            logger.info("Created {} tickets successfully", tickets.size());
            return ResponseEntity.ok("Created " + tickets.size() + " tickets successfully");

        } catch (Exception e) {
            logger.error("Error occurred while creating tickets", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/verify-tickets")
    public ResponseEntity<Map<String, List<TicketVerificationResult>>> verifyTickets(
            @RequestBody List<Ticket> tickets, @RequestParam("secretKey") String secretKey) {
        try {
            List<TicketVerificationResult> results = tickets.stream()
                    .map(ticket -> {
                        boolean isValid = ticketSignatureService.validateTicketCode(ticket, secretKey);
                        return new TicketVerificationResult(
                                ticket.getTicketId(),
                                isValid,
                                isValid ? "Valid ticket" : "Invalid signature"
                        );
                    })
                    .collect(Collectors.toList());

            Map<String, List<TicketVerificationResult>> response = new HashMap<>();
            response.put("results", results);

            logger.info("Verified {} tickets", tickets.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error occurred while verifying tickets", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Ticket>> getAvailableTickets(@RequestParam("eventId") Long eventId) {
        try {
            List<Ticket> availableTickets = ticketService.getAvailableTicketsByEvent(eventId);
            logger.info("Found {} available tickets for event ID: {}", availableTickets.size(), eventId);
            return ResponseEntity.ok(availableTickets);
        } catch (Exception e) {
            logger.error("Error occurred while fetching available tickets", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update-statuses")
    public ResponseEntity<List<Ticket>> updateTicketStatuses(@RequestBody List<TicketStatusUpdateDTO> updates, @RequestHeader("Authorization") String token) throws JWTVerificationException, Exception {
        try {
            // Get Auth0 public key from JWKS endpoint
            /*JwkProvider provider = new UrlJwkProvider(domainUrl);

            //System.out.println("Received token: " + token);
            DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));

            //System.out.println("Decoded JWT: " + jwt.getToken());
            Jwk jwk = provider.get(jwt.getKeyId());
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            // Verify token
            JWT.require(algorithm)
                    .withIssuer(jwt.getIssuer())
                    .build()
                    .verify(token.replace("Bearer ", ""));
            System.out.println("Token verification successful");*/

            verifyToken(token);

            List<Ticket> updatedTickets = ticketService.updateTicketStatuses(updates);
            logger.info("Updated {} tickets", updatedTickets.size());
            return ResponseEntity.ok(updatedTickets);

        } catch (Exception e) {
            logger.error("Error occurred while verifying token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

    }

    @PutMapping("/purchase-tickets")
    public ResponseEntity<?> purchaseTickets(@RequestBody List<TicketStatusUpdateDTO> ticketUpdates, @RequestHeader("Authorization") String token) {
        try {
            // Auth0 token verification
            /*JwkProvider provider = new UrlJwkProvider(domainUrl);
            DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));
            Jwk jwk = provider.get(jwt.getKeyId());
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            // Verify token
            JWT.require(algorithm)
                    .withIssuer(jwt.getIssuer())
                    .build()
                    .verify(token.replace("Bearer ", ""));*/
            verifyToken(token);
            logger.info("Purchase request received for {} tickets", ticketUpdates.size());
            logger.debug("Ticket updates: {}", ticketUpdates);
            // Check if all tickets are available
            for (TicketStatusUpdateDTO update : ticketUpdates) {
                Ticket ticket = ticketRepository.findById(update.getTicketId()).orElse(null);
                logger.info("Ticket status before update: {}", ticket.getTicketStatus());
                if (ticket == null || !"AVAILABLE".equals(ticket.getTicketStatus())) {
                    logger.warn("Ticket with ID {} not found or not available", update.getTicketId());
                    return ResponseEntity.badRequest().body("Requested Tickets not available");
                }
                update.setNewStatus("SOLD");

            }

            List<Ticket> updatedTickets = ticketService.updateTicketStatuses(ticketUpdates);
            logger.info("Updated {} tickets", updatedTickets.size());
            return ResponseEntity.ok(updatedTickets);

        } catch (JWTVerificationException e) {
            logger.error("Error occurred while verifying token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            logger.error("Error occurred while processing ticket purchase", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/refund-tickets")
    public ResponseEntity<?> refundTickets(@RequestBody List<TicketStatusUpdateDTO> ticketUpdates, @RequestHeader("Authorization") String token) {
        try {
            // Auth0 token verification
            /*JwkProvider provider = new UrlJwkProvider(domainUrl);
            DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));
            Jwk jwk = provider.get(jwt.getKeyId());
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            // Verify token
            JWT.require(algorithm)
                    .withIssuer(jwt.getIssuer())
                    .build()
                    .verify(token.replace("Bearer ", ""));*/
            verifyToken(token);

            // Check if all tickets are available
            for (TicketStatusUpdateDTO update : ticketUpdates) {
                Ticket ticket = ticketRepository.findById(update.getTicketId()).orElse(null);
                logger.info("Ticket status before update: {}", ticket.getTicketStatus());

                if (ticket == null || !"SOLD".equals(ticket.getTicketStatus())) {
                    logger.warn("Ticket with ID {} not found or not sold", update.getTicketId());
                    return ResponseEntity.badRequest().body("Requested Tickets not sold");
                }
            }

            // Update all tickets to SOLD
            List<TicketStatusUpdateDTO> soldUpdates = ticketUpdates.stream()
                    .map(update -> {
                        update.setNewStatus("AVAILABLE");
                        return update;
                    })
                    .collect(Collectors.toList());

            List<Ticket> updatedTickets = ticketService.updateTicketStatuses(soldUpdates);
            logger.info("Updated {} tickets", updatedTickets.size());

            return ResponseEntity.ok(updatedTickets);

        } catch (JWTVerificationException e) {
            logger.error("Error occurred while verifying token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            logger.error("Error occurred while processing ticket refund", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/update-prices")
    public ResponseEntity<List<Ticket>> updateTicketPrices(@RequestBody List<TicketPriceUpdateDTO> updates) {
        try {
            List<Ticket> updatedTickets = ticketService.updateTicketPrices(updates);
            logger.info("Updated {} tickets price", updatedTickets.size());

            return ResponseEntity.ok(updatedTickets);
        } catch (Exception e) {
            logger.error("Error occurred while updating ticket prices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/deleteByEventId")
    public ResponseEntity<String> deleteTicketsByEventId(@RequestParam("eventId") Long eventId) {
        try {
            ticketService.deleteByEventId(eventId);
            logger.info("Deleted tickets for eventId: {}", eventId);

            return ResponseEntity.ok("Tickets deleted successfully");
        } catch (Exception e) {
            logger.error("Error occurred while deleting tickets for eventId: {}", eventId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    

    @PostMapping("/reserve")
    public ResponseEntity<?> reserveTickets(@RequestBody List<Long> ticketIds,
            @RequestParam String userEmail,
            @RequestHeader("Authorization") String token) {
        try {
            verifyToken(token);
            logger.info("Received request to reserve tickets for user: {}", userEmail);
            boolean reserved = ticketService.reserveTickets(ticketIds, userEmail);
            logger.info("Reservation status: {}", reserved);

            if (reserved) {
                logger.debug("Reserved Ticket IDs: {}", ticketIds);
                return ResponseEntity.ok("Tickets reserved successfully");
            } else {
                logger.warn("Tickets not available");
                return ResponseEntity.badRequest().body("Tickets not available");
            }
        } catch (Exception e) {
            logger.error("Error occurred while reserving tickets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/release-reservation")
    public ResponseEntity<?> releaseReservation(@RequestBody List<Long> ticketIds,
            @RequestParam String userEmail,
            @RequestHeader("Authorization") String token) {
        try {
            verifyToken(token);
            logger.info("Received request to release reservation for user: {}", userEmail);
            ticketService.releaseReservation(ticketIds, userEmail);
            logger.info("Reservation released successfully");
            return ResponseEntity.ok("Reservation released successfully");
        } catch (Exception e) {
            logger.error("Error occurred while releasing reservation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/check-reservation")
    public ResponseEntity<?> checkTicketsReservation(@RequestBody List<Long> ticketIds) {
        logger.info("Checking reservation status for tickets: {}", ticketIds);
        try {
            for (Long ticketId : ticketIds) {
                String reservationKey = "ticket_reservation:" + ticketId;
                if (redisTemplate.hasKey(reservationKey)) {
                    logger.info("Reservation found for ticket ID: {}", ticketId);
                    return ResponseEntity.ok("Selected Tickets may have been reserved");
                }
            }

            return ResponseEntity.ok("Selected Tickets are available to be reserved");

        } catch (RedisConnectionException e) {
            logger.error("Redis connection error while checking reservations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Unable to check ticket reservations at this time");
        } catch (Exception e) {
            logger.error("Unexpected error while checking ticket reservations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking ticket reservations");
        }
    }

    private DecodedJWT verifyToken(String token) throws Exception {
        JwkProvider provider = new UrlJwkProvider(domainUrl);
        DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));
        Jwk jwk = provider.get(jwt.getKeyId());

        logger.info("JWT Key ID: {}", jwt.getKeyId());

        Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
        logger.info("JWT Issuer: {}", jwt.getIssuer());
        return JWT.require(algorithm)
                .withIssuer(jwt.getIssuer())
                .build()
                .verify(token.replace("Bearer ", ""));
    }

    private DecodedJWT verifyTokenAdminRole(String token) throws Exception {
        JwkProvider provider = new UrlJwkProvider(domainUrl);
        DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));
        Jwk jwk = provider.get(jwt.getKeyId());

        logger.info("JWT Key ID: {}", jwt.getKeyId());

        Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
        logger.info("JWT Issuer: {}", jwt.getIssuer());
        DecodedJWT verifiedJwt = JWT.require(algorithm)
                .withIssuer(jwt.getIssuer())
                .build()
                .verify(token.replace("Bearer ", ""));

        // Check for admin role
        Claim rolesClaim = verifiedJwt.getClaim("https://ticketbookingapp.com/roles");
        if (rolesClaim.isNull()) {
            logger.error("No roles claim found in the token");
            throw new Exception("No roles claim found in the token");
        }

        String[] roles = rolesClaim.asArray(String.class);
        boolean isAdmin = Arrays.asList(roles).contains("TicketBookingApp Admin");

        if (!isAdmin) {
            logger.error("User does not have admin role");
            throw new Exception("User does not have admin role");
        }

        return verifiedJwt;
    }
}
