package com.ticketbooking.Event.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.ticketbooking.Event.dao.EventElasticSearchRepository;
import com.ticketbooking.Event.dao.EventRepository;
import com.ticketbooking.Event.entity.Event;
import com.ticketbooking.Event.entity.EventDocument;
import com.ticketbooking.Event.util.ElasticSearchUtil;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import jakarta.transaction.Transactional;

@Service
public class ElasticSearchService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventElasticSearchRepository eventElasticSearchRepository;

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    private static final Logger logger = LoggerFactory.getLogger(ElasticSearchService.class);

    @Transactional
    public void syncEventToElasticsearch(Event event) {
        logger.info("Syncing event with ID: {} to Elasticsearch", event.getEventId());
        EventDocument eventDocument = convertToEventDocument(event);
        logger.info("Converted event to EventDocument: {}", eventDocument);
        eventElasticSearchRepository.save(eventDocument);
        logger.info("Event saved to Elasticsearch");
    }

    private EventDocument convertToEventDocument(Event event) {
        EventDocument eventDocument = new EventDocument();
        eventDocument.setEventId(event.getEventId());
        eventDocument.setEventName(event.getEventName());
        eventDocument.setVenueId(event.getVenueId());
        eventDocument.setEventStartTime(event.getEventStartTime());
        eventDocument.setEventEndTime(event.getEventEndTime());
        eventDocument.setEventDescription(event.getEventDescription());
        eventDocument.setEventType(event.getEventType());
        eventDocument.setEventDetails(event.getEventDetails());
        eventDocument.setEventStatus(event.getEventStatus());
        return eventDocument;
    }

    @Scheduled(fixedRate = 10000)
    public void syncAllEventsToElasticsearch() {
        try {
            logger.info("Syncing all events to Elasticsearch");
            LocalDateTime currentTime = LocalDateTime.now();
            List<Event> upcomingEvents = eventRepository.findByEventStartTimeGreaterThan(currentTime);

            // Convert and save all upcoming events - this will create the index if it doesn't exist
            List<EventDocument> eventDocumentList = upcomingEvents.stream()
                    .map(this::convertToEventDocument)
                    .collect(Collectors.toList());
            eventElasticSearchRepository.saveAll(eventDocumentList);
            logger.info("All upcoming events synced to Elasticsearch");

            // Only after initial save, get existing docs and clean up
            Iterable<EventDocument> existingDocs = eventElasticSearchRepository.findAll();
            Set<Long> dbEventIds = upcomingEvents.stream()
                    .map(Event::getEventId)
                    .collect(Collectors.toSet());
            logger.debug("Existing docs: {}", existingDocs);

            existingDocs.forEach(doc -> {
                if (!dbEventIds.contains(doc.getEventId())) {
                    eventElasticSearchRepository.deleteById(doc.getEventId());
                }
            });
            logger.info("Cleanup completed");
        } catch (Exception e) {
            logger.error("Error syncing events to Elasticsearch", e);
            System.out.println("Index is being created. Next sync will be successful.");
        }
    }

    public EventDocument getEventById(Long eventId) {
        return eventElasticSearchRepository.findById(eventId).orElse(null);
    }

    public List<EventDocument> searchEventsByVenueId(Long venueId) {
        return eventElasticSearchRepository.findByVenueId(venueId);
    }

    public List<EventDocument> searchEvents(String query) throws IOException {
        try {
            Supplier<Query> supplier = ElasticSearchUtil.createQuery(query);
            SearchResponse<EventDocument> searchResponse = elasticsearchClient.search(s -> s
                    .index("events")
                    .query(supplier.get())
                    .size(100),
                    EventDocument.class);

            return searchResponse.hits().hits().stream()
                    .map(Hit::source)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error during search: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public Page<EventDocument> searchEventsPageable(String query, Pageable pageable) throws IOException {
        try {
            logger.info("Searching events with query: {}", query);

            Supplier<Query> supplier = ElasticSearchUtil.createQuery(query);
            logger.info("Supplier: {}", supplier);

            SearchResponse<EventDocument> searchResponse = elasticsearchClient.search(s -> s
                    .index("events")
                    .query(supplier.get())
                    .from(pageable.getPageNumber() * pageable.getPageSize())
                    .size(pageable.getPageSize()),
                    EventDocument.class);
            logger.info("Search response: {}", searchResponse);

            List<EventDocument> events = searchResponse.hits().hits().stream()
                    .map(Hit::source)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            logger.info("Events found: {}", events);

            long totalHits = searchResponse.hits().total().value();
            logger.info("Total hits: {}", totalHits);

            return new PageImpl<>(events, pageable, totalHits);
        } catch (Exception e) {
            logger.error("Error during search", e);
            return Page.empty();
        }
    }

}
