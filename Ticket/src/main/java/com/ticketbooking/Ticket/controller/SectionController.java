package com.ticketbooking.Ticket.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticketbooking.Ticket.dao.SectionRepository;
import com.ticketbooking.Ticket.entity.Section;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    @Autowired
    private SectionRepository sectionRepository;

    private static final Logger logger = LoggerFactory.getLogger(SectionController.class);

    @GetMapping("/getBySectionId")
    public ResponseEntity<Optional<Section>> getSectionById(@RequestParam Long sectionId) {
        logger.info("Received request to get section by ID: {}", sectionId);
        Optional<Section> section = sectionRepository.findById(sectionId);
        logger.info("Fetched section: {}", section);
        if (section != null) {
            return ResponseEntity.ok(section);
        } else {
            logger.warn("Section with ID {} not found", sectionId);
            return ResponseEntity.notFound().build();
        }

    }

    @GetMapping("/getByEventId")
    public ResponseEntity<List<Section>> getSectionByEventId(@RequestParam Long eventId) {
        logger.info("Received request to get sections by event ID: {}", eventId);
        List<Section> sections = sectionRepository.findByEventId(eventId);
        logger.info("Fetched sections: {}", sections);
        if (sections != null) {
            return ResponseEntity.ok(sections);
        } else {
            logger.warn("No sections found for event ID: {}", eventId);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/createSection")
    public ResponseEntity<Section> createSection(@RequestBody Section section) {
        try {
            Section createdSection = sectionRepository.save(section);
            logger.info("Created section: {}", createdSection);
            return ResponseEntity.ok(createdSection);
        } catch (Exception e) {
            logger.error("Error creating section: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/editSection/{sectionId}")
    public ResponseEntity<Section> editSection(@PathVariable Long sectionId, @RequestBody Section section) {
        logger.info("Received request to edit section with ID: {}", sectionId);
        try {
            Optional<Section> existingSection = sectionRepository.findById(sectionId);

            if (existingSection.isPresent()) {
                logger.info("Found section with ID: {}", sectionId);
                Section updatedSection = existingSection.get();
                updatedSection = section;
                sectionRepository.save(updatedSection);
                logger.info("Updated section: {}", updatedSection);
                return ResponseEntity.ok(updatedSection);
            } else {
                logger.warn("Section with ID {} not found", sectionId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error editing section: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/deleteSection/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long sectionId) {
        try {
            logger.info("Received request to delete section with ID: {}", sectionId);
            Optional<Section> existingSection = sectionRepository.findById(sectionId);
            existingSection.ifPresent(sectionRepository::delete);
            logger.info("Deleted section with ID: {}", sectionId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting section: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

}
