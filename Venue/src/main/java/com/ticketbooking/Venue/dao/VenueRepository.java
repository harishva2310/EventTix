package com.ticketbooking.Venue.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticketbooking.Venue.entity.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long>, JpaSpecificationExecutor<Venue> {
@Query("SELECT v FROM Venue v JOIN VenueOwner vo ON v.venueId = vo.venueId WHERE vo.venueOwnerEmail = :email")
    List<Venue> findVenuesByOwnerEmail(@Param("email") String email);
}
