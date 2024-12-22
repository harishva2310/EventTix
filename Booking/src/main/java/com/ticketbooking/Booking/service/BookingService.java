package com.ticketbooking.Booking.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ticketbooking.Booking.dao.BookingRepository;
import com.ticketbooking.Booking.dto.CancelBookingDTO;
import com.ticketbooking.Booking.entity.Booking;

import jakarta.transaction.Transactional;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Transactional
    public List<Booking> cancelBooking(List<CancelBookingDTO> cancelBookingDTOs) {
        logger.info("Cancelling bookings: {}", cancelBookingDTOs);
        List<Booking> bookings = new ArrayList<>();
        for(CancelBookingDTO cancelBookingDTO : cancelBookingDTOs) {
            Booking booking = bookingRepository.findById(cancelBookingDTO.getBookingId()).orElseThrow();
            logger.debug("Booking found: {}", booking);
            if(booking.getBookingStatus().equals("CONFIRMED")) {
                booking.setBookingStatus("CANCELLED");
                booking.getBookingDetails().remove("qrCode");
                logger.debug("Booking cancelled: {}", booking);
            }
            else {
                logger.debug("Booking is not confirmed");
                throw new RuntimeException("Booking is not confirmed");
            }
        }
        logger.info("Bookings cancelled successfully");
        return bookings;
        
    }
}
