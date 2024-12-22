package com.ticketbooking.Booking.controller;

import java.security.interfaces.RSAPublicKey;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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
import com.auth0.jwt.interfaces.DecodedJWT;
import com.ticketbooking.Booking.dao.BookingRepository;
import com.ticketbooking.Booking.dto.CancelBookingDTO;
import com.ticketbooking.Booking.entity.Booking;
import com.ticketbooking.Booking.service.BookingNotificationService;
import com.ticketbooking.Booking.service.BookingService;
import com.ticketbooking.Booking.util.QRCodeGenerator;
import com.ticketbooking.Booking.util.SecureQRVerifier;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingNotificationService notificationService;

    @Autowired
    private BookingService bookingService;

    @Value("${qr.secret.key}")
    private String qrSecretKey;

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Value("${auth0.domainUrl}")
    private String domainUrl;

    @Autowired
    private SecureQRVerifier secureQRVerifier;

    

    @GetMapping("/getBooking")
    public String getBooking(@RequestParam("bookingId") Long bookingId,
            @RequestHeader("Authorization") String token) {
        try {
            logger.info("getBooking() :Received bookingId: {}", bookingId);
            verifyToken(token);
            String booking = bookingRepository.findById(bookingId).toString();
            logger.debug("Booking: {}", booking);
            return booking;
        } catch (Exception e) {
            logger.error("Error fetching booking: {}", e.getMessage());
            return "Error fetching booking";
        }

    }

    @GetMapping("/getBookingByUserId")
    public ResponseEntity<List<Booking>> getBookingByUserId(@RequestParam("userId") Long userId,
            @RequestHeader("Authorization") String token) {

        try {

            logger.info("getBookingByUserId() : Received userId: {}", userId);
            verifyToken(token);
            List<Booking> bookings = bookingRepository.findByUserId(userId);
            logger.debug("Bookings: {}", bookings);
            if (!bookings.isEmpty()) {

                return ResponseEntity.ok(bookings);
            } else {
                logger.info("No bookings found for user: {}", userId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching bookings for user: {}", userId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/cancelBooking")
    public ResponseEntity<List<Booking>> cancelBooking(@RequestBody List<CancelBookingDTO> cancelBookings,
            @RequestHeader("Authorization") String token) {
        try {
            logger.info("cancelBooking() : Received cancelBookings: {}", cancelBookings);
            verifyToken(token);
            List<Booking> bookings = bookingService.cancelBooking(cancelBookings);
            logger.debug("Bookings: {}", bookings);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error cancelling booking: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/createBooking")
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking, @RequestHeader("Authorization") String token) {
        try {

            logger.info("createBooking() : Received booking: {}", booking);
            
            verifyToken(token);
            

            // Generate QR code as Base64
            String qrCodeBase64 = QRCodeGenerator.generateQRCodeBase64(booking, qrSecretKey);

            booking.getBookingDetails().put("qrCode", qrCodeBase64);

            Booking savedBooking = bookingRepository.save(booking);
            logger.debug("Saved booking: {}", savedBooking);
            notificationService.sendBookingNotification(savedBooking);
            logger.info("Booking created successfully");
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/verifyQRCode")
    public ResponseEntity<Map<String, Object>> verifyQRCode(@RequestBody String qrCodeBase64,
            @RequestHeader("Authorization") String token, @RequestParam("eventSecretKey") String eventSecretKey) {
        try {
            verifyToken(token);
            SecureQRVerifier.VerificationResult result = secureQRVerifier.verifyQRCode(qrCodeBase64, qrSecretKey, eventSecretKey);
            Map<String, Object> response = new HashMap<>();
            response.put("valid", result.isValid());
            response.put("message", result.getMessage());
            response.put("ticketInfo", result.getTicketInfo());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error verifying QR code: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "QR code verification failed");
            return ResponseEntity.badRequest().body(errorResponse);
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
}
