package com.ticketapp.EventSearch.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.ticketapp.EventSearch.dao.EventElasticSearchRepository;
import com.ticketapp.EventSearch.dao.EventWithVenue;
import com.ticketapp.EventSearch.dao.EventWithVenueDocument;
import com.ticketapp.EventSearch.dao.VenueElasticSearchRepository;
import com.ticketapp.EventSearch.entity.EventDocument;
import com.ticketapp.EventSearch.entity.VenueDocument;
import com.ticketapp.EventSearch.service.ElasticSearchService;
import com.ticketapp.EventSearch.service.EventVenueAggregatorService;

@RestController
@RequestMapping("/api/EventSearch")
public class EventSearchController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private final EventVenueAggregatorService aggregatorService;

    @Autowired
    private ElasticSearchService elasticSearchService;

    @Autowired
    private EventElasticSearchRepository eventElasticSearchRepository;

    @Autowired
    private VenueElasticSearchRepository venueElasticSearchRepository;

    public EventSearchController(RestTemplate restTemplate, EventVenueAggregatorService aggregatorService) {
        this.restTemplate = restTemplate;
        this.aggregatorService = aggregatorService;
    }

    

    @GetMapping("/search")
    public ResponseEntity<List<EventWithVenue>> searchEventVenues(@RequestParam String query) {
        List<EventWithVenue> results = aggregatorService.getEventsWithVenues(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/v2/search")
    public ResponseEntity<List<EventWithVenue>> searchEventVenuesV2(@RequestParam String query) {
        List<EventWithVenue> results = aggregatorService.getEventsWithVenues(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/getAllVenues")
    public ResponseEntity<List<VenueDocument>> getAllVenues() {
        Iterable<VenueDocument> venuesIterable = venueElasticSearchRepository.findAll();
        List<VenueDocument> venues = StreamSupport.stream(venuesIterable.spliterator(), false)
                .collect(Collectors.toList());
        return ResponseEntity.ok(venues);
    }

    

    @GetMapping("/v4/search")
    public ResponseEntity<Page<EventWithVenueDocument>> searchEvents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String eventDate,
            @PageableDefault(size = 20) Pageable pageable) throws IOException {

        Page<EventWithVenueDocument> results = elasticSearchService.searchEventsWithVenue(
                query, eventType, city, country, eventDate, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/getEventById/{eventId}")
    public ResponseEntity<EventWithVenueDocument> getEventWithVenue(@PathVariable Long eventId) {
        try {
            EventWithVenueDocument eventWithVenue = elasticSearchService.getEventWithVenueById(eventId);
            if (eventWithVenue == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(eventWithVenue);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/getEventbyVenueId/{venueId}")
    public ResponseEntity<List<EventDocument>> getEventByVenueId(@PathVariable Long venueId) {
        List<EventDocument> events = eventElasticSearchRepository.findByVenueId(venueId);
        return ResponseEntity.ok(events);
    }
}
