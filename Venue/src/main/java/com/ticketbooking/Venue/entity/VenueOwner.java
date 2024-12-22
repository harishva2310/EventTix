package com.ticketbooking.Venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "VENUE_OWNER")
@Data
public class VenueOwner {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "VENUE_OWNER_ID")
    private Long venueOwnerId;

    @Column(name = "VENUE_OWNER_NAME")
    private String venueOwnerName;

    @Column(name = "VENUE_OWNER_EMAIL")
    private String venueOwnerEmail;

    @Column(name= "VENUE_ID")
    private Long venueId;

    
}
