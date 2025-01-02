package com.ticketapp.EventSearch.dao;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ticketapp.EventSearch.entity.EventDocument;
import com.ticketapp.EventSearch.entity.VenueDocument;

import lombok.Data;

@Data
@Document(indexName = "events_with_venues")
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventWithVenueDocument {
    @Id
    private String id;

    @Field(type = FieldType.Object, name = "event")
    private EventDocument event;

    @Field(type = FieldType.Object, name = "venue")
    private VenueDocument venue;

    // Default constructor for Jackson
    public EventWithVenueDocument() {
        this.id = UUID.randomUUID().toString();
    }
    
    public EventWithVenueDocument(EventDocument event, VenueDocument venue) {
        this.id = UUID.randomUUID().toString();
        this.event = event;
        this.venue = venue;
    }
}
