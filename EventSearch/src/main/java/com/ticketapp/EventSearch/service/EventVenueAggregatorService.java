/**
 * The `EventVenueAggregatorService` is responsible for aggregating event and venue data from external APIs.
 * It provides methods to search for events and venues based on a given query, and to retrieve event details with their associated venue information.
 */
package com.ticketapp.EventSearch.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ticketapp.EventSearch.dao.Event;
import com.ticketapp.EventSearch.dao.EventWithVenue;
import com.ticketapp.EventSearch.dao.Venue;

@Service
public class EventVenueAggregatorService {

    private final RestTemplate restTemplate;
    private final String eventsApiUrl;
    private final String venueApiUrl;
    private final String venueIdApiUrl;
    private final String eventIdApiUrl;

    @Autowired
    public EventVenueAggregatorService(
            RestTemplate restTemplate,
            @Value("${events.api.url}") String eventsApiUrl,
            @Value("${venues.api.url}") String venueApiUrl,
            @Value("${venues.api.getVenueByIdUrl}") String venueIdApiUrl,
            @Value("${events.api.getEventByIdUrl}") String eventIdApiUrl) {
        this.restTemplate = restTemplate;
        this.eventsApiUrl = eventsApiUrl;
        this.venueApiUrl = venueApiUrl;
        this.venueIdApiUrl = venueIdApiUrl;
        this.eventIdApiUrl = eventIdApiUrl;
    }

    public List<EventWithVenue> getEventsWithVenues(String query) {
        List<Event> events = searchEvents(query);
        if (!events.isEmpty()) {
            return events.stream()
                    .map(this::getEventWithVenueInfo)
                    .collect(Collectors.toList());
        } else {
            List<Venue> venues = searchVenues(query);
            if (!venues.isEmpty()) {
                return venues.stream()
                        .flatMap(venue -> searchEventsWithVenue(venue).stream())
                        .collect(Collectors.toList());
            }
        }
        
        return Collections.emptyList();
        
    }

    private List<Event> searchEvents(String query) {
        String url = eventsApiUrl + "?query=" + query;
        System.out.println("Events url searchEvents: "+url);
        ResponseEntity<Event[]> response = restTemplate.getForEntity(url, Event[].class);
        System.out.println("Events array searchEvents: "+Arrays.asList(response.getBody()));
        return Arrays.asList(response.getBody());
    }

    private List<Venue> searchVenues(String query) {
        String url = venueApiUrl + "?query=" + query;
        System.out.println("Venues url searchVenues: "+url);
        ResponseEntity<Venue[]> response = restTemplate.getForEntity(url, Venue[].class);
        System.out.println("Venues array searchVenues: "+Arrays.asList(response.getBody()));
        return Arrays.asList(response.getBody());
    }

    private EventWithVenue getEventWithVenueInfo(Event event){
        Venue venue = getVenueById(event.getVenue_id());
        return new EventWithVenue(event, venue);
    }
    

    private List<Event> getEventByVenueId(Long venueId) {
        String url = eventIdApiUrl + "/" + venueId;
        System.out.println("Event ID: "+venueId);
        System.out.println("Event URL: "+url);
        ResponseEntity<Event[]> response = restTemplate.getForEntity(url, Event[].class);
        List<Event> events = Arrays.asList(response.getBody());
        System.out.println("Event response: " + events);
        return events;
    }

    private Venue getVenueById(Long venueId) {
        String url = venueIdApiUrl + "/" + venueId;
        System.out.println("Venue ID: "+venueId);
        System.out.println("Venue URL: "+url);
        System.out.println("Venue response: "+restTemplate.getForObject(url, Venue.class));
        return restTemplate.getForObject(url, Venue.class);
    }

    private List<EventWithVenue> searchEventsWithVenue(Venue venue) {
        List<Event> events = getEventByVenueId(venue.getVenue_id());
        System.out.println("Events array searchEventsWithVenue: "+events);
        return events.stream()
                .map(event -> new EventWithVenue(event, venue))
                .collect(Collectors.toList());
    }
}
