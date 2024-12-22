package com.ticketbooking.Event.entity;

import java.time.LocalDateTime;
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
@Table(name = "event")
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "event_name")
    private String eventName;

    @Column(name ="venue_id")
    private Long venueId;

    @Column(name="event_status")
    private String eventStatus;

    @Column(name = "event_start_datetime")
    private LocalDateTime eventStartTime;

    @Column(name = "event_end_datetime")
    private LocalDateTime eventEndTime;

    @Column(name = "event_description")
    private String eventDescription;

    @Column(name = "event_type")
    private String eventType;

    @Column(name = "event_details", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> eventDetails;

}
