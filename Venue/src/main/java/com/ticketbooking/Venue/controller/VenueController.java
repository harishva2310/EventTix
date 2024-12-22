package com.ticketbooking.Venue.controller;

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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
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
import com.ticketbooking.Venue.dao.VenueRepository;
import com.ticketbooking.Venue.entity.Venue;
import com.ticketbooking.Venue.entity.VenueDocument;
import com.ticketbooking.Venue.service.ElasticSearchService;

import co.elastic.clients.elasticsearch.ElasticsearchClient;

@RestController
@RequestMapping("/api/venue")
public class VenueController {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private ElasticSearchService elasticSearchService;

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    @Value("${AUTH0_DOMAIN_URL}")
    private String domainUrl;

    private static final Logger logger = LoggerFactory.getLogger(VenueController.class);

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        logger.info("Retrieving all venues");
        List<Venue> venues = venueRepository.findAll();
        logger.debug("Retrieved {} venues", venues.size());
        return ResponseEntity.ok(venues);
    }

    @GetMapping("/id/{venue_id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable("venue_id") Long venueId) {
        logger.info("Retrieving venue with ID: {}", venueId);
        Venue venue = venueRepository.findById(venueId).orElse(null);
        logger.debug("Retrieved venue: {}", venue);
        if (venue == null) {
            logger.warn("Venue with ID {} not found", venueId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(venue);
    }

    @PostMapping("/create")
    public ResponseEntity<Venue> createVenue(@RequestBody Venue venue, @RequestHeader("Authorization") String token) {
        try {
            verifyTokenAdminRole(token);
            logger.info("Creating venue: {}", venue);
            Venue createdVenue = venueRepository.save(venue);
            logger.debug("Created venue: {}", createdVenue);
            return ResponseEntity.ok(createdVenue);
        } catch (Exception e) {
            logger.error("Failed to create venue", e);
            return ResponseEntity.badRequest().build();
        }

    }

    @GetMapping("/search")
    public ResponseEntity<List<Venue>> searchVenues(
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) String venueName,
            @RequestParam(required = false) String venueCity,
            @RequestParam(required = false) String venueState,
            @RequestParam(required = false) String venueCountry,
            @RequestParam(required = false) String venueAddress,
            @RequestParam(required = false) Integer venueCapacity,
            @RequestParam(required = false) String venueType) {

        Specification<Venue> spec = Specification.where(null);

        spec = addCriteria(spec, venueId, id -> (root, query, cb)
                -> cb.equal(root.get("venueId"), id));

        spec = addCriteria(spec, venueName, n -> (root, query, cb)
                -> cb.like(cb.lower(root.get("venueName")), "%" + n.toLowerCase() + "%"));

        spec = addCriteria(spec, venueCity, c -> (root, query, cb)
                -> cb.like(cb.lower(root.get("venueCity")), "%" + c.toLowerCase() + "%"));

        spec = addCriteria(spec, venueState, s -> (root, query, cb)
                -> cb.like(cb.lower(root.get("venueState")), "%" + s.toLowerCase() + "%"));

        spec = addCriteria(spec, venueCountry, c -> (root, query, cb)
                -> cb.like(cb.lower(root.get("venueCountry")), "%" + c.toLowerCase() + "%"));

        spec = addCriteria(spec, venueAddress, a -> (root, query, cb)
                -> cb.like(cb.lower(root.get("venueAddress")), "%" + a.toLowerCase() + "%"));

        spec = addCriteria(spec, venueCapacity, c -> (root, query, cb)
                -> cb.greaterThanOrEqualTo(root.get("venueCapacity"), c));

        spec = addCriteria(spec, venueType, t -> (root, query, cb)
                -> cb.equal(cb.lower(root.get("venueType")), t.toLowerCase()));

        List<Venue> venues = venueRepository.findAll(spec);
        return ResponseEntity.ok(venues);
    }

    private <T> Specification<Venue> addCriteria(Specification<Venue> spec, T value,
            Function<T, Specification<Venue>> specFunction) {
        return Optional.ofNullable(value)
                .filter(v -> v instanceof String ? StringUtils.hasText((String) v) : true)
                .map(specFunction)
                .map(spec::and)
                .orElse(spec);
    }

    @GetMapping("/getVenueById/{venueId}")
    public ResponseEntity<Optional<VenueDocument>> getVenueByIdElasticSearch(@PathVariable("venueId") Long venueId) throws IOException {
        logger.info("Retrieving venue with ID: {}", venueId);
        Optional<VenueDocument> venue = elasticSearchService.getVenueById(venueId);
        logger.debug("Retrieved venue: {}", venue);
        if (venue == null) {
            logger.warn("Venue with ID {} not found", venueId);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(venue);
    }

    @GetMapping("/v2/search")
    public ResponseEntity<List<VenueDocument>> searchVenuesElastic(@RequestParam String query) throws IOException {
        try {
            logger.info("Searching venues with query: {}", query);
            List<VenueDocument> venues = elasticSearchService.searchVenues(query);
            logger.debug("Found {} venues", venues.size());
            return ResponseEntity.ok(venues);
        } catch (Exception e) {
            logger.error("Failed to search venues", e);
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
            throw new Exception("No roles claim found in the token");
        }

        String[] roles = rolesClaim.asArray(String.class);
        boolean isAdmin = Arrays.asList(roles).contains("TicketBookingApp Admin");

        if (!isAdmin) {
            throw new Exception("User does not have admin role");
        }

        return verifiedJwt;
    }

}
