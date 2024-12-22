package com.ticketapp.EventSearch.dao;

import lombok.Data;
@Data
public class EventWithVenue {

    private Event event;
    private Venue venue;

    public EventWithVenue(Event event, Venue venue) {
        this.event = event;
        this.venue = venue;
    }
}
