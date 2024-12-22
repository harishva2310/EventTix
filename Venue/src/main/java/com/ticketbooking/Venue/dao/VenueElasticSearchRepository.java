package com.ticketbooking.Venue.dao;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.ticketbooking.Venue.entity.VenueDocument;

public interface VenueElasticSearchRepository extends ElasticsearchRepository<VenueDocument, Long> {

}
