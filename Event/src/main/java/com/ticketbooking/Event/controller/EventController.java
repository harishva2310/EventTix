package com.ticketbooking.Event.controller;

import java.io.IOException;
import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.ticketbooking.Event.dao.EventElasticSearchRepository;
import com.ticketbooking.Event.dao.EventRepository;
import com.ticketbooking.Event.entity.Event;
import com.ticketbooking.Event.entity.EventDocument;
import com.ticketbooking.Event.service.ElasticSearchService;
import com.ticketbooking.Event.service.EventService;

import co.elastic.clients.elasticsearch.ElasticsearchClient;


@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventElasticSearchRepository eventElasticSearchRepository;

    @Autowired
    private ElasticSearchService elasticSearchService;

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    @Autowired
    private EventService eventService;

    @Value("${AUTH0_DOMAIN_URL}")
    private String domainUrl;

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        logger.info("Fetching all events");
        List<Event> events = eventRepository.findAll();
        logger.debug("Fetched {} events", events.size());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/getEventTypes")
    public ResponseEntity<List<String>> getEventTypes() {
        logger.info("Fetching all event types");
        List<String> eventTypes = eventRepository.findDistinctEventTypes();
        logger.debug("Fetched {} event types", eventTypes.size());
        return ResponseEntity.ok(eventTypes);
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<Event> getEventById(@PathVariable Long eventId) {
        logger.info("Fetching event with ID: {}", eventId);
        Optional<Event> event = eventRepository.findById(eventId);
        logger.debug("Fetched event: {}", event);
        if (event.isPresent()) {
            logger.info("Event found: {}", event.get());
            return ResponseEntity.ok(event.get());
        } else {
            logger.warn("Event not found with ID: {}", eventId);
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/updateDetails/{eventId}")
    public ResponseEntity<Event> updateEventDetailsArray(
            @PathVariable Long eventId,
            @RequestParam String key,
            @RequestBody List<String> values,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            verifyTokenAdminRole(authorizationHeader);
            logger.info("Updating event details for event ID: {}", eventId);

            Event updatedEvent = eventService.addEventDetailArray(eventId, key, values);
            logger.debug("Updated event: {}", updatedEvent);

            return ResponseEntity.ok(updatedEvent);
        } catch (Exception e) {
            logger.error("Error updating event details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEvents(
            @RequestParam(required = false, value = "eventName") String eventName,
            @RequestParam(required = false, value = "venueId") Long venueId,
            @RequestParam(required = false, value = "eventStartTime") String eventStartTime,
            @RequestParam(required = false, value = "eventEndTime") String eventEndTime,
            @RequestParam(required = false, value = "eventDescription") String eventDescription,
            @RequestParam(required = false, value = "eventType") String eventType) {
        logger.info("Searching events with parameters: eventName={}, venueId={}, eventStartTime={}, eventEndTime={}, eventDescription={}, eventType={}", eventName, venueId, eventStartTime, eventEndTime, eventDescription, eventType);
        Specification<Event> spec = Specification.where(null);

        spec = addCriteria(spec, eventName, e -> (root, query, cb)
                -> cb.like(cb.lower(root.get("eventName")), "%" + e.toLowerCase() + "%"));
        logger.debug("Added eventName criteria");

        spec = addCriteria(spec, venueId, v -> (root, query, cb)
                -> cb.equal(root.get("venueId"), v));
        logger.debug("Added venueId criteria");

        spec = addCriteria(spec, eventStartTime, s -> (root, query, cb)
                -> cb.greaterThanOrEqualTo(root.get("eventStartTime"), s));
        logger.debug("Added eventStartTime criteria");

        spec = addCriteria(spec, eventEndTime, e -> (root, query, cb)
                -> cb.lessThanOrEqualTo(root.get("eventEndTime"), e));
        logger.debug("Added eventEndTime criteria");

        spec = addCriteria(spec, eventDescription, d -> (root, query, cb)
                -> cb.like(cb.lower(root.get("eventDescription")), "%" + d.toLowerCase() + "%"));
        logger.debug("Added eventDescription criteria");

        spec = addCriteria(spec, eventType, t -> (root, query, cb)
                -> cb.equal(root.get("eventType"), t.toLowerCase()));
        logger.debug("Added eventType criteria");

        List<Event> events = eventRepository.findAll(spec);
        logger.debug("Found {} events matching the search criteria", events.size());

        return ResponseEntity.ok(events);
    }

    private <T> Specification<Event> addCriteria(Specification<Event> spec, T value,
            Function<T, Specification<Event>> specFunction) {
        return Optional.ofNullable(value)
                .filter(v -> v instanceof String ? StringUtils.hasText((String) v) : true)
                .map(specFunction)
                .map(spec::and)
                .orElse(spec);
    }

    @GetMapping("/v2/search")
    public ResponseEntity<List<EventDocument>> searchEvents(@RequestParam String query) {
        try {
            List<EventDocument> results = elasticSearchService.searchEvents(query);
            return ResponseEntity.ok(results);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/v3/search")
    public ResponseEntity<Page<EventDocument>> searchEvents(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "eventName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        try {
            logger.info("Searching events with query: {}, page: {}, size: {}, sortBy: {}, direction: {}", query, page, size, sortBy, direction);

            Pageable pageable = PageRequest.of(page, size);
            Page<EventDocument> results = elasticSearchService.searchEventsPageable(query, pageable);
            logger.info("Found {} events matching the search criteria", results.getTotalElements());
            logger.debug("Results: {}", results);

            return ResponseEntity.ok(results);
        } catch (IOException e) {
            e.printStackTrace();
            logger.error("Error searching events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getEventById/{eventId}")
    public ResponseEntity<EventDocument> getEventByIdElasticSearch(@PathVariable Long eventId) {
        logger.info("Fetching event with ID: {}", eventId);
        EventDocument event = elasticSearchService.getEventById(eventId);
        logger.debug("Fetched event: {}", event);
        if (event != null) {
            
            return ResponseEntity.ok(event);
        } else {
            logger.warn("Event with ID {} not found", eventId);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/getEventbyVenueId/{venueId}")
    public ResponseEntity<List<EventDocument>> getEventByVenueId(@PathVariable Long venueId, @RequestHeader("Authorization") String token) throws Exception {
        verifyTokenAdminRole(token);
        logger.info("Fetching events for venue ID: {}", venueId);
        List<EventDocument> events = eventElasticSearchRepository.findByVenueId(venueId);
        logger.debug("Fetched {} events for venue ID {}", events.size(), venueId);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/create")
    public ResponseEntity<Event> createEvent(@RequestBody Event event, @RequestHeader("Authorization") String token) {
        try {
            verifyTokenAdminRole(token);
            logger.info("Creating event");
            logger.debug("Creating event: {}", event);
            Event savedEvent = eventRepository.save(event);

            logger.info("Event created successfully");
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            logger.error("Error creating event", e);
            return ResponseEntity.badRequest().build();
        }
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
