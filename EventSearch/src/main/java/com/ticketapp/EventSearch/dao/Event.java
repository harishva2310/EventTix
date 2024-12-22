package com.ticketapp.EventSearch.dao;

import java.util.Map;

import lombok.Data;

@Data
public class Event {
    private Long event_id;
    private String event_name;
    private Long venue_id;
    private String event_start_time;
    private String event_end_time;
    private String event_description;
    private String event_type;
    private Map<String, Object> event_details;
}
