package com.ticketapp.EventSearch.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.ticketapp.EventSearch.dao.EventElasticSearchRepository;
import com.ticketapp.EventSearch.dao.EventWithVenueDocument;
import com.ticketapp.EventSearch.dao.VenueElasticSearchRepository;
import com.ticketapp.EventSearch.entity.EventDocument;
import com.ticketapp.EventSearch.entity.VenueDocument;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;

@Service
@EnableScheduling
public class EventSyncService {

    private static final Logger logger = LoggerFactory.getLogger(EventSyncService.class);
    private static final int BATCH_SIZE = 100;

    @Autowired
    private EventElasticSearchRepository eventRepository;

    @Autowired
    private VenueElasticSearchRepository venueRepository;

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    @Scheduled(fixedRate = 120000) // 2 minutes in milliseconds
    public void syncEventsAndVenues() {
        AtomicInteger processedCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);

        try {
            int pageNumber = 0;
            Page<EventDocument> eventPage;

            do {
                eventPage = eventRepository.findAll(PageRequest.of(pageNumber, BATCH_SIZE));
                List<EventWithVenueDocument> batchCombinedData = new ArrayList<>();

                eventPage.getContent().forEach(event -> {
                    try {
                        VenueDocument venue = venueRepository.findById(event.getVenueId())
                                .orElseThrow(() -> new RuntimeException("Venue not found for ID: " + event.getVenueId()));

                        batchCombinedData.add(new EventWithVenueDocument(event, venue));
                        processedCount.incrementAndGet();

                    } catch (Exception e) {
                        errorCount.incrementAndGet();
                        logger.error("Error processing event ID {}: {}", event.getEventId(), e.getMessage());
                    }
                });

                // Process the batch
                if (!batchCombinedData.isEmpty()) {
                    processBatch(batchCombinedData);
                }

                pageNumber++;
            } while (pageNumber < eventPage.getTotalPages());

            logger.info("Sync completed. Processed: {}, Errors: {}",
                    processedCount.get(), errorCount.get());

        } catch (Exception e) {
            logger.error("Fatal error during sync process: {}", e.getMessage());
            throw new RuntimeException("Sync process failed", e);
        }
    }

    private void processBatch(List<EventWithVenueDocument> batchData) {
        try {
            BulkRequest.Builder bulkRequest = new BulkRequest.Builder();
            String combinedIndexName = "events_with_venues";

            for (EventWithVenueDocument document : batchData) {
                bulkRequest.operations(op -> op
                        .index(idx -> idx
                        .index(combinedIndexName)
                        .id(document.getEvent().getEventId().toString())
                        .document(document)
                        )
                );
            }

            BulkResponse response = elasticsearchClient.bulk(bulkRequest.build());

            if (response.errors()) {
                // Process any failed items
                for (BulkResponseItem item : response.items()) {
                    if (item.error() != null) {
                        logger.error("Failed to index document {}: {}",
                                item.id(), item.error().reason());
                    }
                }
            }

            logger.info("Successfully processed batch of {} records into index '{}'",
                    batchData.size(), combinedIndexName);

        } catch (Exception e) {
            logger.error("Error processing batch: {}", e.getMessage());
            throw new RuntimeException("Batch processing failed", e);
        }
    }
}
