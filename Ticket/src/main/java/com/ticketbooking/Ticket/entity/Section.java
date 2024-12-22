package com.ticketbooking.Ticket.entity;

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
@Table(name = "section")
@Data
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "section_id")
    private Long sectionId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "venue_id")
    private Long venueId;

    @Column(name = "section_name")
    private String sectionName;

    @Column(name = "section_capacity")
    private Integer sectionCapacity;

    @Column(name = "section_seating")
    private String sectionSeating;

    @Column(name = "section_width", columnDefinition = "BIGINT DEFAULT 0")
    private Long sectionWidth;

    @Column(name = "section_details", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> sectionDetails;

    
}
