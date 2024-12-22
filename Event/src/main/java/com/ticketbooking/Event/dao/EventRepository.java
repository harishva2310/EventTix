package com.ticketbooking.Event.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.ticketbooking.Event.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event>  {

    List<Event> findByEventNameContainingIgnoreCase(String query);

    @Query("SELECT DISTINCT e.eventType FROM Event e")
    List<String> findDistinctEventTypes();

    List<Event> findByEventStartTimeGreaterThan(LocalDateTime currentTime);
}
