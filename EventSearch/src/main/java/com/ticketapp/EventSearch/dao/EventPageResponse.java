package com.ticketapp.EventSearch.dao;

import java.util.List;

import lombok.Data;

@Data
public class EventPageResponse {
    private List<Event> content;
    private int totalPages;
    private long totalElements;
    private boolean last;
    private boolean first;
    private int size;
    private int number;
    private int numberOfElements;
}
