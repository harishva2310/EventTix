package com.ticketbooking.Venue.controller;

import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
import com.ticketbooking.Venue.dao.VenueOwnerRepository;
import com.ticketbooking.Venue.dao.VenueRepository;
import com.ticketbooking.Venue.entity.Venue;
import com.ticketbooking.Venue.entity.VenueOwner;
import com.ticketbooking.Venue.service.VenueOwnerService;

@RestController
@RequestMapping("/api/venueOwner")
public class VenueOwnerController {

    @Autowired
    private VenueOwnerRepository venueOwnerRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VenueOwnerService venueOwnerService;

    @Value("${auth0.domainUrl}")
    private String domainUrl;

    private static final Logger logger = LoggerFactory.getLogger(VenueOwnerController.class);

    // Add your controller methods here
    @GetMapping("/getVenuebyOwnerEmail")
    public ResponseEntity<List<Venue>> getVenueByOwnerEmail(@RequestParam String email, @RequestHeader("Authorization") String token) {
        try {
            logger.info("Fetching venues by owner email: {}", email);
            verifyTokenAdminRole(token);

            List<Venue> venues = venueOwnerService.findVenuesByOwnerEmail(email);
            logger.debug("fetching venues by owner email: {}", email);
            logger.debug("Venues:  {}", venues);
            return ResponseEntity.ok(venues);
        } catch (Exception e) {
            logger.error("Error in getVenueByOwnerEmail: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/addVenueToOwner")
    public ResponseEntity<String> addVenueToOwner(@RequestParam Long venueId, @RequestParam String email, @RequestHeader("Authorization") String token) {
        try {
            logger.info("Adding venue with ID {} to owner with email {}", venueId, email);
            verifyTokenAdminRole(token);
            Venue venue = venueRepository.findById(venueId).orElse(null);
            if (venue == null) {
                logger.error("Venue with ID {} not found", venueId);
                return ResponseEntity.notFound().build();
            }
            VenueOwner venueOwner = new VenueOwner();
            venueOwner.setVenueId(venueId);
            venueOwner.setVenueOwnerEmail(email);
            venueOwnerRepository.save(venueOwner);
            logger.info("Venue with ID {} added to owner with email {}", venueId, email);
            return ResponseEntity.ok("Venue added to owner successfully");
        } catch (Exception e) {
            logger.error("Error in addVenueToOwner: {}", e.getMessage());
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
