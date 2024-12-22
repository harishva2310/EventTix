package com.ticketbooking.Booking.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.Booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    public List<Booking> findByUserId(Long userId);

    
}
