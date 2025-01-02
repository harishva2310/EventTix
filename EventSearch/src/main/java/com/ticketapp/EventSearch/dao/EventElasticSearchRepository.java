package com.ticketapp.EventSearch.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.ticketapp.EventSearch.entity.EventDocument;

public interface EventElasticSearchRepository extends ElasticsearchRepository<EventDocument, Long> {

    @Query("{\"multi_match\": {\"query\": \"?0\", \"fields\": [\"event_name^3\", \"event_description^2\", \"event_type\", \"event_details.*\"], \"type\": \"best_fields\", \"fuzziness\": \"AUTO\"}}")
    List<EventDocument> searchByAllFields(String query);

    List<EventDocument> findByVenueId(Long venueId);
    Page<EventDocument> findByEventStartTimeGreaterThan(LocalDateTime dateTime, Pageable pageable);
    
}
