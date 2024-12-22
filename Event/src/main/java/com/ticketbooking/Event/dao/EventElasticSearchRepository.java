package com.ticketbooking.Event.dao;

import java.util.List;

import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.ticketbooking.Event.entity.EventDocument;

public interface EventElasticSearchRepository extends ElasticsearchRepository<EventDocument, Long> {

    List<EventDocument> findByEventNameContainingIgnoreCase(String query);

    @Query("{\"multi_match\": {\"query\": \"?0\", \"fields\": [\"event_name^3\", \"event_description^2\", \"event_type\", \"event_details.*\"], \"type\": \"best_fields\", \"fuzziness\": \"AUTO\"}}")
    List<EventDocument> searchByAllFields(String query);

    List<EventDocument> findByVenueId(Long venueId);
    
}
