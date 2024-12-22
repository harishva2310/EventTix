package com.ticketapp.EventSearch.service;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ticketapp.EventSearch.dao.EventElasticSearchRepository;
import com.ticketapp.EventSearch.dao.EventWithVenueDocument;
import com.ticketapp.EventSearch.dao.VenueElasticSearchRepository;
import com.ticketapp.EventSearch.entity.EventDocument;
import com.ticketapp.EventSearch.entity.VenueDocument;
import com.ticketapp.EventSearch.util.ElasticSearchUtil;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;

@Service
public class ElasticSearchService {

    @Autowired
    private EventElasticSearchRepository eventElasticSearchRepository;

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    @Autowired
    private VenueElasticSearchRepository venueElasticSearchRepository;

    public EventDocument getEventById(Long eventId) {
        return eventElasticSearchRepository.findById(eventId).orElse(null);
    }

    public List<EventDocument> searchEventsByVenueId(Long venueId) {
        return eventElasticSearchRepository.findByVenueId(venueId);
    }

    public Page<EventWithVenueDocument> searchEventsWithVenue(String query, String eventType, String city,
            String country, String eventDate, Pageable pageable) throws IOException {
        try {
            Supplier<Query> supplier = ElasticSearchUtil.createQuery(query, eventType, city, country, eventDate);
            SearchResponse<EventWithVenueDocument> searchResponse = elasticsearchClient.search(s -> s
                    .index("events_with_venues")
                    .query(supplier.get())
                    .from(pageable.getPageNumber() * pageable.getPageSize())
                    .size(pageable.getPageSize()),
                    EventWithVenueDocument.class);

            List<EventWithVenueDocument> results = searchResponse.hits().hits().stream()
                    .map(hit -> {
                        EventWithVenueDocument doc = hit.source();
                        return doc;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            long totalHits = searchResponse.hits().total().value();
            return new PageImpl<>(results, pageable, totalHits);
        } catch (Exception e) {
            //logger.error("Error during search: {}", e.getMessage(), e);
            throw new RuntimeException("Search operation failed", e);
        }
    }

    public Optional<VenueDocument> getVenueById(Long venueId) throws IOException {
        return Optional.ofNullable(venueElasticSearchRepository.findById(venueId).orElse(null));
    }

    public EventWithVenueDocument getEventWithVenueById(Long eventId) throws IOException {
        SearchResponse<EventWithVenueDocument> searchResponse = elasticsearchClient.search(s -> s
            .index("events_with_venues")
            .query(q -> q
                .match(m -> m
                    .field("event.event_id")
                    .query(eventId.toString())
                )
            ),
            EventWithVenueDocument.class
        );
        
        return searchResponse.hits().hits().stream()
            .map(hit -> hit.source())
            .findFirst()
            .orElse(null);
    }
}
