package com.ticketapp.EventSearch.dao;

import lombok.Data;

@Data
public class Venue {
    private Long venue_id;
    private String venue_name;
    private String venue_city;
    private String venue_state;
    private String venue_country;
    private String venue_address;
    private int venue_capacity;
    private String venue_type;
}
