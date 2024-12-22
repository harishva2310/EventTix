package com.ticketbooking.Venue.entity;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Document(indexName = "venues")
@JsonIgnoreProperties(ignoreUnknown = true)
public class VenueDocument {

    @Id
    @Field(type = FieldType.Long, name = "venue_id")
    @JsonProperty("venue_id")
    private Long venueId;

    @Field(type = FieldType.Text, name = "venue_name")
    @JsonProperty("venue_name")
    private String venueName;

    @Field(type = FieldType.Text, name = "venue_address")
    @JsonProperty("venue_address")
    private String venueAddress;

    @Field(type = FieldType.Text, name = "venue_city")
    @JsonProperty("venue_city")
    private String venueCity;

    @Field(type = FieldType.Text, name = "venue_state")
    @JsonProperty("venue_state")
    private String venueState;

    @Field(type = FieldType.Text, name = "venue_country")
    @JsonProperty("venue_country")
    private String venueCountry;

    @Field(type = FieldType.Integer, name = "venue_capacity")
    @JsonProperty("venue_capacity")
    private Integer venueCapacity;

    @Field(type = FieldType.Text, name = "venue_type")
    @JsonProperty("venue_type")
    private String venueType;

    @Field(type = FieldType.Object, name = "venue_details")
    @JsonProperty("venue_details")
    private Map<String, Object> venueDetails;
}
