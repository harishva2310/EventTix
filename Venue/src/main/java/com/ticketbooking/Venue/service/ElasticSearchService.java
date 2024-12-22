package com.ticketbooking.Venue.service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.ticketbooking.Venue.dao.VenueElasticSearchRepository;
import com.ticketbooking.Venue.dao.VenueRepository;
import com.ticketbooking.Venue.entity.Venue;
import com.ticketbooking.Venue.entity.VenueDocument;
import com.ticketbooking.Venue.util.ElasticSearchUtil;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import jakarta.transaction.Transactional;

@Service
public class ElasticSearchService {

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VenueElasticSearchRepository venueElasticSearchRepository;

    private static final Logger logger = LoggerFactory.getLogger(ElasticSearchService.class);

    @Transactional
    public void syncToElasticSearch(Venue venue) {
        VenueDocument venueDocument = convertoVenueDocument(venue);
        venueElasticSearchRepository.save(venueDocument);
    }

    public VenueDocument convertoVenueDocument(com.ticketbooking.Venue.entity.Venue venue) {
        VenueDocument venueDocument = new VenueDocument();
        venueDocument.setVenueId(venue.getVenueId());
        venueDocument.setVenueName(venue.getVenueName());
        venueDocument.setVenueAddress(venue.getVenueAddress());
        venueDocument.setVenueCity(venue.getVenueCity());
        venueDocument.setVenueState(venue.getVenueState());
        venueDocument.setVenueCountry(venue.getVenueCountry());
        venueDocument.setVenueCapacity(venue.getVenueCapacity());
        venueDocument.setVenueType(venue.getVenueType());
        venueDocument.setVenueDetails(venue.getVenueDetails());
        return venueDocument;
    }

    @Scheduled(fixedRate = 10000) // Run every 10 seconds
    public void syncAllVenuesToElasticSearch() {
        List<Venue> venues = venueRepository.findAll();
        
        List<VenueDocument> venueDocuments = venues.stream().map(this::convertoVenueDocument).collect(Collectors.toList());
        logger.info("Syncing " + venues.size() + " venues to ElasticSearch.");

        venueElasticSearchRepository.saveAll(venueDocuments);
        
    }

    public List<VenueDocument> searchVenues(String query) throws IOException {
        try{
        Supplier<Query> querySupplier = ElasticSearchUtil.createQuery(query);
        SearchResponse<VenueDocument> response = elasticsearchClient.search(s -> s
        .index("venues")
        .query(querySupplier.get()), VenueDocument.class);

        return response.hits().hits().stream().map(Hit::source).filter(Objects::nonNull).collect(Collectors.toList());
        }
        catch(Exception e){
            System.out.println(e.getMessage());
            return Collections.emptyList();
        }
    }

    public Optional<VenueDocument> getVenueById(Long venueId) throws IOException {
        return Optional.ofNullable(venueElasticSearchRepository.findById(venueId).orElse(null));
    }
}

