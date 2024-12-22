package com.ticketbooking.Venue.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ticketbooking.Venue.dao.VenueOwnerRepository;
import com.ticketbooking.Venue.dao.VenueRepository;
import com.ticketbooking.Venue.entity.Venue;

@Service
public class VenueOwnerService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VenueService venueService;

    @Autowired
    private VenueOwnerRepository venueOwnerRepository;

    private static final Logger logger = LoggerFactory.getLogger(VenueOwnerService.class);


    public List<Venue> findVenuesByOwnerEmail(String email) {
        return venueRepository.findVenuesByOwnerEmail(email);
    }

}
