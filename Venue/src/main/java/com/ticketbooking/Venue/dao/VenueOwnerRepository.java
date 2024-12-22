package com.ticketbooking.Venue.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.Venue.entity.VenueOwner;

public interface VenueOwnerRepository extends JpaRepository<VenueOwner, Long> {
    List<VenueOwner> findByVenueOwnerEmail(String email);
}
