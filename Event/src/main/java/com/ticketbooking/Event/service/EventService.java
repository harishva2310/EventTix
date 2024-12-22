package com.ticketbooking.Event.service;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ticketbooking.Event.dao.EventRepository;
import com.ticketbooking.Event.entity.Event;

import jakarta.persistence.EntityNotFoundException;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event addEventDetailArray(Long eventId, String key, List<String> values) {
    Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

    if (event.getEventDetails() == null) {
        event.setEventDetails(new HashMap<>());
    }
    
    event.getEventDetails().put(key, values);
    return eventRepository.save(event);
}
}
