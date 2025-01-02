package com.ticketapp.EventSearch.dao;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;



public interface EventWithVenueElasticRepository extends ElasticsearchRepository<EventWithVenueDocument, String>{
    Page<EventWithVenueDocument> findByEventEventEndTimeLessThan(LocalDateTime dateTime, Pageable pageable);
}
