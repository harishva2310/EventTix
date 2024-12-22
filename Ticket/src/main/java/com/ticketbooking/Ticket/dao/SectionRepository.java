package com.ticketbooking.Ticket.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.Ticket.entity.Section;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByEventId(Long eventId);
}
