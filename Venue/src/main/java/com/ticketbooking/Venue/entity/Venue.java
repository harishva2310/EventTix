package com.ticketbooking.Venue.entity;

import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "VENUE")
@Data
public class Venue {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "VENUE_ID")
    private Long venueId;

    @Column(name = "VENUE_NAME")
    private String venueName;

    @Column(name = "VENUE_CITY")
    private String venueCity;

    @Column(name = "VENUE_STATE")
    private String venueState;

    @Column(name = "VENUE_COUNTRY")
    private String venueCountry;

    @Column(name = "VENUE_ADDRESS")
    private String venueAddress;

    @Column(name = "VENUE_CAPACITY")
    private int venueCapacity;

    @Column(name = "VENUE_TYPE")
    private String venueType;

    @Column(name = "venue_details", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> venueDetails;
}
