package com.ticketapp.EventSearch.dao;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.ticketapp.EventSearch.entity.VenueDocument;

public interface VenueElasticSearchRepository extends ElasticsearchRepository<VenueDocument, Long>{

}
