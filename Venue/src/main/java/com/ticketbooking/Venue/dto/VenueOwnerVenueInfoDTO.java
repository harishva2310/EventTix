package com.ticketbooking.Venue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VenueOwnerVenueInfoDTO {
    private Long venueOwnerId;
    private String venueOwnerName;
    private String venueOwnerEmail;
    private Long venueId;
    private String venueName;
    private String venueLocation;
    private Integer capacity;
    private String venueType;
    private String venueCity;

}
